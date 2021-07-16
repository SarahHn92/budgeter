let db;
let budgetVersion;

// Creating a new instance of an indexedDB db
const request = indexedDB.open('budgetDB', budgetVersion || 21);

request.onupgradeneeded = function (e) {
    console.log('Beware: Upgrade needed');
    const { oldVersion } = e;
    const newversion = e.newVersion || db.version;
    console.log(`DB update from ${oldVersion} to ${newVersion}`);
    db = e.target.result;

    if (db.objectStoreNames.length === 0) {
        db.createObjectStore('budgetStore', { autoIncrement: true });
    }
};

// catching errors
request.onerror = function (e) {
    console.log(`${e.target.errorCode}`);
};

function checkDatabase() {
    // Open and access a transaction in the db
    let transaction = db.transaction(['budgetStore'], 'readwrite');

    const store = transaction.objectStore('budgetStore');

    // Getting all records from objectStore
    const getAll = store.getAll();

    // If request successful, fetch json data and add to online db
    getAll.onsuccess = function () {
        if getAll.result.length > 0 {
            fetch('/api/transaction/bulk', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
            .then ((res) => res.json())
            .then((res) => {
                if (res.length !== 0) {
                    transaction = db.transaction(['budgetStore'], 'readwrite');

                    const currentStore = transaction.objectStore('budgetStore');

                    currentStore.clear();
                    console.log('Storage cleared!');
                }
            });
        }
    };
}

request.onsuccess = function (e) {
    console.log('Succeeded');
    db = e.target.result;
    if (navigator.onLine) {
        console.log('Connected to DB!');
        checkDatabase();
    }
};

const saveRecord = (record) => {
    const transaction = db.transaction(['budgetStore'], 'readwrite');
    const store = transaction.objectStore('budgetStore');

    store.add(record);
};

window.addEventListener('online', checkDatabase);