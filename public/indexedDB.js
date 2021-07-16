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