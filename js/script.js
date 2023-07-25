'use strict';

// Data
const account1 = {
    owner: 'Jonas Schmedtmann',
    movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
    interestRate: 1.2, // %
    pin: 1111,

    movementsDates: [
        '2023-07-17T13:15:33.035Z',
        '2023-07-18T09:48:16.867Z',
        '2023-07-19T06:04:23.907Z',
        '2023-07-20T14:18:46.235Z',
        '2023-07-21T16:33:06.386Z',
        '2023-07-22T14:43:26.374Z',
        '2023-07-23T18:49:59.371Z',
        '2023-07-25T12:01:20.894Z',
    ],
    currency: 'EUR',
    locale: 'pt-PT', // de-DE
};

const account2 = {
    owner: 'Jessica Davis',
    movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
    interestRate: 1.5,
    pin: 2222,

    movementsDates: [
        '2023-07-17T13:15:33.035Z',
        '2023-07-18T09:48:16.867Z',
        '2023-07-19T06:04:23.907Z',
        '2023-07-20T14:18:46.235Z',
        '2023-07-21T16:33:06.386Z',
        '2023-07-22T14:43:26.374Z',
        '2023-07-23T18:49:59.371Z',
        '2023-07-24T12:01:20.894Z',
    ],
    currency: 'USD',
    locale: 'en-US',
};

const account3 = {
    owner: 'James Wang',
    movements: [1000, 2000, -3000, 4000, -2000, 1340, 4592, -2320],
    interestRate: 1.1,
    pin: 3333,

    movementsDates: [
        '2023-07-17T13:15:33.035Z',
        '2023-07-18T09:48:16.867Z',
        '2023-07-19T06:04:23.907Z',
        '2023-07-20T14:18:46.235Z',
        '2023-07-21T16:33:06.386Z',
        '2023-07-22T14:43:26.374Z',
        '2023-07-23T18:49:59.371Z',
        '2023-07-24T12:01:20.894Z',
    ],
    currency: 'CNY',
    locale: 'zh-CN',
};

const accounts = [account1, account2, account3];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

// Functions
const createUsernames = function (accounts) {
    accounts.forEach(account => {
        account.username = account.owner
                                  .toLowerCase()
                                  .split(' ')
                                  .map(name => name[0])
                                  .join('');
    });
};
createUsernames(accounts);

const calcDaysPassed = function (date1, date2) {
    return Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));
};

const formatMovementDate = function (date, local) {
    const dayPassed = calcDaysPassed(new Date(), date);

    if (dayPassed === 0) {
        return 'Today';
    }
    if (dayPassed === 1) {
        return 'Yesterday';
    }
    if (dayPassed <= 7) {
        return `${dayPassed} days ago`;
    }

    return new Intl.DateTimeFormat(local).format(date);

};

const formatCurrency = function (value, local, currency) {
    return new Intl.NumberFormat(local, {
        style: 'currency',
        currency: currency
    }).format(value);
};

const displayMovements = function (account, sort = false) {
    containerMovements.innerHTML = '';
    const ms = sort ? account.movements.slice()
                             .sort((a, b) => a - b) : account.movements;

    ms.forEach(function (mov, i) {
        const type = mov > 0 ? 'deposit' : 'withdrawal';
        const displayDate = formatMovementDate(new Date(account.movementsDates[i]), account.locale);
        const html = `
        <div class="movements__row">
          <div class="movements__type movements__type--${type}">${i + 1} ${type}</div>
          <div class="movements__date">${displayDate}</div>
          <div class="movements__value">${formatCurrency(mov, account.locale, account.currency)}</div>
        </div>
        `;
        containerMovements.insertAdjacentHTML('afterbegin', html);
    });
};

const calcDisplayBalance = function (account) {
    account.balance = account.movements.reduce((acc, cur) => acc + cur);
    labelBalance.textContent = `${formatCurrency(account.balance, account.locale, account.currency)}`;
};

const calcDisplaySummary = function (account) {
    const incomes = account.movements
                           .filter(e => e > 0)
                           .reduce((acc, cur) => acc + cur);
    const out = account.movements
                       .filter(e => e < 0)
                       .reduce((acc, cur) => acc + cur);
    const interest = account.movements
                            .filter(e => e > 0)
                            .map(e => e * account.interestRate / 100)
                            .filter(e => e > 1)
                            .reduce((acc, cur) => acc + cur);
    labelSumIn.textContent = `${formatCurrency(incomes, account.locale, account.currency)}`;
    labelSumOut.textContent = `${formatCurrency(out, account.locale, account.currency)}`;
    labelSumInterest.textContent = `${formatCurrency(interest, account.locale, account.currency)}`;
};

const updateUI = function (account) {
    // Display movements
    displayMovements(account);

    // Display balance
    calcDisplayBalance(account);

    // Display summary
    calcDisplaySummary(account);
};

const startLogoutTimer = function () {
    // Set time to 5 minutes
    let time = 300;

    // Call the timer every second
    const tick = function () {
        const minute = Math.trunc(time / 60)
                           .toString()
                           .padStart(2, '0');
        const second = (time % 60).toString()
                                  .padStart(2, '0');

        // In each call, print the remaining time to UI
        labelTimer.textContent = `${minute}:${second}`;

        // When 0 second, stop timer and logout user
        if (time-- === 0) {
            clearInterval(timer);
            labelWelcome.textContent = 'Log in to get started';
            containerApp.style.opacity = '0';
        }

    };
    tick();
    const timer = setInterval(tick, 1000);

    return timer;
};

// Event handler
let currentAccount, timer;

btnLogin.addEventListener('click', function (e) {
    // Prevent form from submitting
    e.preventDefault();
    currentAccount = accounts.find(e => e.username === inputLoginUsername.value);

    if (currentAccount?.pin === +inputLoginPin.value) {
        // Display UI and welcome message
        labelWelcome.textContent = `Welcome back, ${currentAccount.owner.split(' ')[0]}`;
        containerApp.style.opacity = '100';

        // Create current date and time
        const now = new Date();
        const options = {
            hour: 'numeric',
            minute: 'numeric',
            day: 'numeric',
            month: 'numeric',
            year: 'numeric',
        };
        labelDate.textContent = new Intl.DateTimeFormat(currentAccount.locale, options).format(now);

        // Clear input fields
        inputLoginUsername.value = inputLoginPin.value = '';
        inputLoginPin.blur(); // lose focus

        if (timer) {
            clearInterval(timer);
        }
        timer = startLogoutTimer();

        // Update UI
        updateUI(currentAccount);
    }
});

btnTransfer.addEventListener('click', function (e) {
    e.preventDefault();
    const amount = Number(inputTransferAmount.value);
    const receiverAccount = accounts.find(e => e.username === inputTransferTo.value);
    inputTransferAmount.value = inputTransferTo.value = '';

    if (amount > 0
        && currentAccount.balance >= amount
        && receiverAccount
        && receiverAccount.username !== currentAccount.username) {
        // Doing the transfer
        const date = new Date().toISOString();
        currentAccount.movements.push(-amount);
        currentAccount.movementsDates.push(date);
        receiverAccount.movements.push(amount);
        receiverAccount.movementsDates.push(date);

        // Update UI
        updateUI(currentAccount);

        // Reset timer
        clearInterval(timer);
        timer = startLogoutTimer();
    }
});

btnLoan.addEventListener('click', function (e) {
    e.preventDefault();

    const amount = Math.floor(inputLoanAmount.value);

    if (amount > 0 && currentAccount.movements.some(e => e >= amount * 0.1)) {
        setTimeout(function () {
            // Add movement
            currentAccount.movements.push(amount);
            currentAccount.movementsDates.push(new Date().toISOString());

            // Update II
            updateUI(currentAccount);

            // Reset timer
            clearInterval(timer);
            timer = startLogoutTimer();
        }, 2500);
    }

    inputLoanAmount.value = '';
});

btnClose.addEventListener('click', function (e) {
    e.preventDefault();

    if (inputCloseUsername.value === currentAccount.username
        && +inputClosePin.value === currentAccount.pin) {
        // Delete account
        const index = accounts.findIndex(e => e.username === currentAccount.username);
        accounts.splice(index, 1);

        // Hide UI
        containerApp.style.opacity = '0';
    }

    inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
    e.preventDefault();
    sorted = !sorted;
    displayMovements(currentAccount, sorted);
});
