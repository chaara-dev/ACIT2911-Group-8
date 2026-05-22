const displayError = (errorMessage) => {
  const signupButton = document.getElementById("signupButton");

  if (!document.querySelector(".signup-error")) {
    const error = document.createElement("p");
    error.textContent = errorMessage;
    error.classList.add("signup-error");
    signupButton.after(error);
  }
};

const createNewAccount = () => {
  const signupButton = document.getElementById("signupButton");

  signupButton.addEventListener("click", async () => {
    const email = document.getElementById("email-input").value;
    const password = document.getElementById("password-input").value;
    const newAccount = { email: email, password: password };

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAccount),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      window.location.href = "/login";
    } catch (error) {
      console.log(error);
      return displayError(error);
    }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      signupButton.click();
    }
  });
};

const main = () => {
  createNewAccount();
};

main();
