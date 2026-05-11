const displayError = () => {
  const pageTitle = document.querySelector(".title");
  if (!document.querySelector(".missing-fields-error")) {
    const error = document.createElement("p");
    error.textContent = "All fields must be filled in";
    // placeholder style, can delete these style lines and edit with
    // subscription-create.css with .missing-fields-error claass
    error.style.color = "red";
    error.style.fontWeight = "bold";
    error.style.fontSize = "1.5rem";
    error.style.display = "flex";
    error.style.justifyContent = "center";
    error.classList.add("missing-fields-error");

    pageTitle.after(error);
  }
};

const createNewSubscription = async () => {
  const createSub = document.getElementById("submitButton");

  createSub.addEventListener("click", async () => {
    const subNameValue = document.getElementById("subscriptionName").value;
    const subPriceValue = document.getElementById("subscriptionPrice").value;
    const subDateValue = document.getElementById("subscriptionDate").value;
    const subscriptionPeriodValue = document.getElementById(
      "subscriptionPeriodSelect",
    ).value;

    if (
      !subNameValue ||
      !subPriceValue ||
      !subDateValue ||
      !subscriptionPeriodValue
    ) {
      return displayError();
    }

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
      if (!res.ok) {
        throw new Error("Could not fetch POST request");
      }
    } catch (error) {
      console.log(error);
    }
  });
};

const main = async () => {
  try {
    await createNewSubscription();
  } catch (error) {
    console.log(error);
  }
};

main();
