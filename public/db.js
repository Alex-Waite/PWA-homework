let db;

const request = indexedDB.open("budget", 1);

// object store made
request.onupgradeneeded = function (event) {
    const db = event.target.result;
    db.createObjectStore("pending", { autoIncrement: true });
}

// online checker
request.onsuccess = function(event) {
    db = event.target.result;
    if (navigator.onLine) {
      checkDatabase();
    }
};

// makes transacton, adds to object store
function saveRecord(record) {
    const transaction = db.transaction(["pending"], "readwrite");
    const store = transaction.objectStore("pending");
    store.add(record);
}

// check the database
function checkDatabase() {
    const transaction = db.transaction(["pending"], "readwrite");
    const store = transaction.objectStore("pending");
    const getAll = store.getAll();
  
    getAll.onsuccess = function() {
      if (getAll.result.length > 0) {
        fetch("/api/transaction/bulk", {
          method: "POST",
          body: JSON.stringify(getAll.result),
          headers: {
            Accept: "application/json, text/plain, */*",
            "Content-Type": "application/json"
          }
        })
        .then(response => response.json())
          .then(() => {
            // delete records if successful
            const transaction = db.transaction(["pending"], "readwrite");
            const store = transaction.objectStore("pending");
            store.clear();
          });
      }
    };
}

// error
request.onerror = function(event) {
    console.log("Woops! " + event.target.errorCode);
};

// listen to see if app is coming online
window.addEventListener("online", checkDatabase);