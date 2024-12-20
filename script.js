const loginUserEmail = localStorage.getItem('loginUserEmail');
console.log(loginUserEmail);

function loginUser() {
    const userEmail = document.getElementById('logEmail').value; // Assuming your email input has id 'email'
    const userPassword = document.getElementById('logPass').value; // Assuming your password input has id 'password'


    fetch('https://jsonserverforloginsystem.onrender.com/users')
        .then(response => response.json())
        .then(data => {
            // Find the user with the provided email and password
            const user = data.find(user => user.email === userEmail && user.password === userPassword);

            if (user) {
                // Redirect based on the user's role
                switch (user.role) {
                    case 'admin':
                        window.location.href = 'adminPage.html'; // Redirect to the admin page
                        localStorage.setItem('loginUserEmail', user.email); // Store the email in localStorage
                        break;
                    case 'volunteer':
                        window.location.href = 'userDetails.html'; // Redirect to the user page
                        localStorage.setItem('loginUserEmail', user.email); // Store the email in localStorage
                        break;
                    default:
                        window.location.href = 'UserCardSystem.html'; // Redirect to a default page
                        localStorage.setItem('loginUserEmail', user.email); // Store the email in localStorage
                }
            } else {
                // Handle invalid credentials
                alert('Invalid email or password');
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function logout() {
    localStorage.setItem('loginUserEmail', null);
    window.location.href = "login.html";
    document.getElementById("logEmail").value = "";
    document.getElementById("logPass").value = "";
}

function childSearch(cId) {
    const inputUid = document.getElementById("childId").value; // Replace with the user's UID
    const usernameInput = document.getElementById("user-username");
    const cBalanceInput = document.getElementById("user-cBalance");

    // Make a GET request to the API
    fetch('https://jsonserverforloginsystem.onrender.com/childrenData')
        .then((response) => response.json())
        .then((data) => {
            // Find the user with the provided UID
            const user = data.find((item) => item.userId === inputUid || item.userId === cId);

            if (user) {
                // Populate input fields with user data
                console.log(user, loginUserEmail);
                usernameInput.textContent = user.userId;
                cBalanceInput.textContent = user.cardBalance;
            } else {
                // Handle UID not found
                alert("UID not found");
            }
        })
        .catch((error) => {
            console.error("Error:", error);
        });
}

function subtractCredit(user, credit) {
    if (user && typeof user.cardBalance === 'number' && typeof credit === 'number') {
        user.cardBalance -= credit;
    }
}

function addCredit(user, credit) {
    if (user && typeof user.cardBalance === 'number' && typeof credit === 'number') {
        user.cardBalance += credit;
    }
}

function updateCredit(operation) {
    const cardCreditInput = document.getElementById('card-credit');
    const inputUid = document.getElementById("user-username").textContent;
    const usernameInput = document.getElementById("user-username");
    const cBalanceInput = document.getElementById("user-cBalance");
    let sign = "";
    const apiUrl = 'https://jsonserverforloginsystem.onrender.com/childrenData';

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            // Find the user with the provided UID
            const user = data.find(item => item.userId === inputUid);

            if (user) {
                // Get the credit amount from the input field
                const credit = parseFloat(cardCreditInput.value);

                if (!isNaN(credit) && credit > 0 && credit < user.cardBalance) {
                    // Subtract credit from the user's cardBalance
                    if (operation === 'subcredit'){
                        console.log("Substracting credit");
                        subtractCredit(user, credit);
                        sign = "-";
                    } else if (operation === 'addcredit') {
                        console.log("adding credit");
                        addCredit(user, credit);
                        sign = "+";
                    }

                    // Make a PUT request to update the user's data
                    fetch(`${apiUrl}/${user.id}`, {
                        method: 'PUT',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(user),
                    })
                        .then(response => response.json())
                        .then(updatedUser => {
                            // Handle the updated user data if needed
                            usernameInput.textContent = user.userId;
                            cBalanceInput.textContent = user.cardBalance;
                            console.log('User data updated:', updatedUser);
                            const transactionData = {
                                loginUserEmail: localStorage.getItem('loginUserEmail'),
                                childId: user.userId,
                                debitAmount: sign +""+ cardCreditInput.value,
                                afterTranBalance: user.cardBalance,
                              };
                        
                            // Make a POST request to add transaction history
                            fetch('https://jsonserverforloginsystem.onrender.com/transationHistory', {
                                method: 'POST',
                                headers: {
                                'Content-Type': 'application/json',
                                },
                                body: JSON.stringify(transactionData),
                            })
                            .then(response => response.json())
                            .then(newTransactionData => {
                                console.log('Transaction history added successfully:', newTransactionData);
                                // Handle the new transaction history data if needed
                            })
                            .catch(error => {
                                console.error('Error adding transaction history:', error);
                            });
                        })
                        .catch(error => {
                            console.error('Error updating user data:', error);
                        });
                } else {
                    alert('Invalid credit amount. Please enter a positive number.');
                }
            } else {
                // Handle UID not found
                alert('UID not found');
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function newchildRegister() {
    const apiUrl = 'https://jsonserverforloginsystem.onrender.com/childrenData';
    const regChildId = document.getElementById("reg-childId").value;
    const regChildBalance = parseInt(document.getElementById("reg-childBalance").value, 10);

    // Create a new user object
    const newChildData = {
        "userId": regChildId,
        "cardBalance": regChildBalance
    };

    // Make a GET request to check if the userId is already taken
    fetch(`${apiUrl}?userId=${newChildData.userId}`)
        .then(response => response.json())
        .then(existingUser => {
            if (existingUser.length === 0) {
                // No user with the same userId exists, so it's safe to proceed with the POST request
                // Make a POST request to add user data
                fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newChildData),
                })
                .then(response => response.json())
                .then(newUserData => {
                    console.log('User data added successfully:', newUserData);
                    // Handle the new user data if needed
                })
                .catch(error => {
                    console.error('Error adding user data:', error);
                });
            } else {
                // User with the same userId already exists, handle the error
                alert('Child with the same ChildId already exists');
            }
        })
        .catch(error => {
        console.error('Error checking for existing user data:', error);
    });
    // Save the updated user data to the JSON file (optional)

    // Clear the registration form fields
    document.getElementById("reg-childId").value = "";
    document.getElementById("reg-childBalance").value = "";
}

function newuserregistration() {
    const apiUrl = 'https://jsonserverforloginsystem.onrender.com/users';
    const regEmail = document.getElementById("reg-email").value;
    const regPassword = document.getElementById("reg-password").value;
    const regRole = document.getElementById("reg-role").value;

    // Create a new user object
    const newUserRegData = {
        "email": regEmail,
        "password": regPassword,
        "role": regRole
    };

    // Make a GET request to check if the userId is already taken
    fetch(`${apiUrl}?email=${newUserRegData.email}`)
        .then(response => response.json())
        .then(existingUser => {
            if (existingUser.length === 0) {
                // No user with the same userId exists, so it's safe to proceed with the POST request
                // Make a POST request to add user data
                fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newUserRegData),
                })
                .then(response => response.json())
                .then(newUserData => {
                    console.log('User data added successfully:', newUserData);
                    // Handle the new user data if needed
                })
                .catch(error => {
                    console.error('Error adding user data:', error);
                });
            } else {
                // User with the same userId already exists, handle the error
                alert('User with the same userId already exists');
            }
        })
        .catch(error => {
        console.error('Error checking for existing user data:', error);
    });
    // Save the updated user data to the JSON file (optional)

    // Clear the registration form fields
    document.getElementById("reg-email").value = "";
    document.getElementById("reg-password").value = "";
    document.getElementById("reg-role").value = "";
}

// Function to fetch transaction history data and populate the table
function populateTransactionTable() {
    const tableBody = document.querySelector('#transactionTable tbody');
    
    // Clear existing rows in the table body
    tableBody.innerHTML = '';
  
    // Fetch transaction history data from the server
    fetch('https://jsonserverforloginsystem.onrender.com/transationHistory')
      .then(response => response.json())
      .then(data => {
        // Iterate through the transaction data and create table rows
        data.forEach((transaction, index) => {
          const row = tableBody.insertRow();
  
          // Create table cells and populate them with data
          const cellId = row.insertCell(0);
          const cellLoginUserEmail = row.insertCell(1);
          const cellChildId = row.insertCell(2);
          const cellDebitAmount = row.insertCell(3);
          const cellAfterTranBalance = row.insertCell(4);
  
          // Populate table cells with data from the transaction
          cellId.textContent = transaction.id;
          cellLoginUserEmail.textContent = transaction.loginUserEmail;
          cellChildId.textContent = transaction.childId;
          cellDebitAmount.textContent = transaction.debitAmount;
          cellAfterTranBalance.textContent = transaction.afterTranBalance;
        });
      })
      .catch(error => {
        console.error('Error fetching transaction data:', error);
      });
  }
  
  // Call the function to populate the table with data from the server
  //populateTransactionTable();
  
