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
    const subName = document.getElementById("subscriptionName").value;
    const subPrice = document.getElementById("subscriptionPrice").value;
    const subPeriod = document.getElementById("subscriptionPeriodSelect").value;
    const subRenewalDate = document.getElementById("subscriptionDate").value;

    const newSub = {
      name: subName,
      cost: parseFloat(subPrice),
      billing_type: subPeriod,
      renewal_date: subRenewalDate,
    };

    try {
      const res = await fetch(`/api/subscriptions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSub),
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
