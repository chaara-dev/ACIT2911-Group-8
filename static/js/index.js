const getSubscriptions = async () => {
  try {
    const res = await fetch(`/api/subscriptions`);
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data["error"]);
    }

    return data.subscriptions;
  } catch (error) {
    console.log(error);
  }
};

const calculateNextRenewal = (subs) => {
  return "pass";
};

const calculateTotalCost = (subs) => {
  return "pass";
};

// filter ?

// search ?

const displayDashboard = (subs) => {
  const activeSubsValue = document.getElementById("active-sub");
  activeSubsValue.textContent = subs.length;

  const nextRenewalValue = document.getElementById("next-renew");
  nextRenewalValue.textContent = calculateNextRenewal(subs);

  const totalCostValue = document.getElementById("total-price");
  totalCostValue.textContent = calculateTotalCost(subs);
};

const displaySubscriptions = (subs) => {
  const subCards = document.querySelector(".cards");
  subCards.replaceChildren();

  subs.forEach((sub) => {
    const card = document.createElement("div");
    card.classList.add("card");

    const cost = document.createElement("span");
    cost.textContent = sub.cost;
    card.appendChild(cost);

    const name = document.createElement("span");
    name.textContent = sub.name;
    card.appendChild(name);

    const renewal = document.createElement("span");
    renewal.textContent = "?";
    card.appendChild(renewal);

    subCards.appendChild(card);
  });
};

const main = async () => {
  try {
    const subs = await getSubscriptions();

    if (subs === undefined) {
      throw new Error("Could not get subscriptions");
    }

    displayDashboard(subs);
    displaySubscriptions(subs);
  } catch (error) {
    console.log(error);
  }
};

main();
