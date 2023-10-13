document.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.getElementById("table-body");
  const expenseForm = document.getElementById("expense-form");

  // Function to fetch and display expenses
  async function displayExpenses() {
    //Fetching token from local storage
    const token = localStorage.getItem("token");
    //setting header
    const config = {
      headers: { Authorization: token },
    };
    //sending a GET request to the backend with token in the header to fetch particular users data only
    const response = await axios.get("http://localhost:3000/user/getexpense", config);
    const { expensesDetails: data } = response.data;
    console.log(data);
    // const datePart = .split(' ')[0];

      // Clear the table
      tableBody.innerHTML = '';

      // Populate the table with data
      data.forEach((expense) => {
          addRow(expense);
      });
  }

  // Function to add a new row to the table
  function addRow(expense) {
    let date = expense.createdAt.split('T')[0];
      const row = document.createElement("tr");
      row.innerHTML = `
          <td>${date}</td>
          <td>${expense.description}</td>
          <td>${expense.category}</td>
          <td>Rs. ${expense.amount}</td>
      `;
      tableBody.appendChild(row);
  }

  // Fetch and display expenses when the page loads
  displayExpenses();
});