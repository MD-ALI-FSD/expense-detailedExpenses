

const submit = document.querySelector(".submit");
const email = document.querySelector("#email");



/****************************************************/
// Listening to the Click on Submit button
/****************************************************/
submit.addEventListener("click", async function(e) {
  try{
  e.preventDefault();

   //Fetching token from local storage
   const token = localStorage.getItem("token");
   //setting header
   const config = {
     headers: { Authorization: token },
   };

  const rcvdEmail = email.value;

  const obj ={
    email: rcvdEmail,
  }

  const response = await axios.post("http://localhost:3000/user/forgotpassword", obj, config);
  // console.log(response);
  alert("Email sent successfully");
} catch (error) {
  if (error.response && error.response.status === 400) {
    const errorMessage = error.response.data.message; // Access the error message
    console.log("Error:", errorMessage);
    alert("Error: " + errorMessage); // Display the error message
  } else {
    console.log(error);
    alert("An error occurred");
  }

  // axios.post("http://localhost:3000/user/forgotpassword", obj, config)
  // .then((response) => {
  //   console.log(response);
  //   alert("Email sent successfully");
  // })
  // .catch((error) => {
  //   if (error.response && error.response.status === 400) {
  //     const errorMessage = error.response.data.message; // Access the error message
  //     console.log("Error:", errorMessage);
  //     alert("Error: " + errorMessage); // Display the error message
  //   } else {
  //     console.log(error);
  //     alert("An error occurred");
  //   }
  }
})


// fetch(`http://localhost:3000/user/resetpassword/2`)
// .then((response) => {
//   console.log("response fetched")
//   console.log(response.message);
//   window.location.href = "./updatePassword.html";
// })