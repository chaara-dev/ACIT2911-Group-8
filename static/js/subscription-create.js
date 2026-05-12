const displayError = (errorMessage) => {
  const pageTitle = document.querySelector(".submitButtonDiv");

  if (!document.querySelector(".missing-fields-error")) {
    const error = document.createElement("p");
    error.textContent = "All fields must be filled in";
    error.classList.add("missing-fields-error");
    pageTitle.after(error);
  }
};

const createNewSubscription = () => {
  const createSub = document.getElementById("submitButton");

  createSub.addEventListener("click", async () => {
    const subNameValue = document.getElementById("subscriptionName").value;
    const subPriceValue = document.getElementById("subscriptionPrice").value;
    const subDateValue = document.getElementById("subscriptionDate").value;
    const subscriptionPeriodValue = document.getElementById(
      "subscriptionPeriodSelect",
    ).value;

    const newSubscription = {
      user_id: 14, // change after adding sessions
      name: subNameValue,
      cost: parseFloat(subPriceValue),
      billing_type: subscriptionPeriodValue,
    };

    try {
      const res = await fetch(`/api/subscriptions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSubscription),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data["error"]);
      }
    } catch (error) {
      console.log(error);
      return displayError(error.message);
    }
  });
};

const main = () => {
  createNewSubscription();
};

main();
