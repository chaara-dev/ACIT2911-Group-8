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

const calculateRenewalDays = (renewalDate) => {
  const difference = new Date(renewalDate) - new Date();
  return Math.ceil(difference / (24 * 60 * 60 * 1000));
};

const calculateNextRenewal = (subs) => {
  if (subs.length === 0) {
    return "N/A";
  }
  return calculateRenewalDays(subs[0]["renewal_date"]);
};

const calculateTotalCost = (subs) => {
  let total = 0;
  for (const sub of subs) {
    if (sub["billing_type"] === "Monthly") {
      total += sub["cost"];
    }
  }
  return total.toFixed(2);
};

const filterSubscriptions = (subs, billing_type) => {
  if (!billing_type) return subs;
  return subs.filter((sub) => sub.billing_type === billing_type);
};

const searchSubscriptions = (subs, search) => {
  if (!search) return subs;
  const needle = search.toLowerCase();
  return subs.filter((sub) => String(sub.name).toLowerCase().includes(needle));
};

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
    cost.textContent = `$${sub.cost}`;
    card.appendChild(cost);

    const name = document.createElement("span");
    name.textContent = sub.name;
    card.appendChild(name);

    const renewal = document.createElement("span");
    const renewalDays = calculateRenewalDays(sub.renewal_date);
    renewal.textContent = `${renewalDays} days`;
    card.appendChild(renewal);

    subCards.appendChild(card);
  });
};

let allSubscriptions = [];
let activeSearch = "";
let activeBillingFilter = "";

const applySubscriptionView = () => {
  let shown = allSubscriptions;
  shown = searchSubscriptions(shown, activeSearch);
  shown = filterSubscriptions(shown, activeBillingFilter);
  displayDashboard(shown);
  displaySubscriptions(shown);
};

const main = async () => {
  try {
    const subs = await getSubscriptions();

    if (subs === undefined) {
      throw new Error("Could not get subscriptions");
    }

    allSubscriptions = subs;
    applySubscriptionView();

    const filterButton = document.getElementById("filter-button");
    const searchButton = document.getElementById("search-button");

    if (filterButton) {
      filterButton.addEventListener("click", () => {
        const value = window.prompt(
          "Filter by billing type (Monthly, Yearly), or leave empty to show all:",
          activeBillingFilter,
        );
        if (value === null) return;
        activeBillingFilter = value.trim();
        applySubscriptionView();
      });
    }

    if (searchButton) {
      searchButton.addEventListener("click", () => {
        const value = window.prompt(
          "Search subscriptions by name, or leave empty to clear:",
          activeSearch,
        );
        if (value === null) return;
        activeSearch = value.trim();
        applySubscriptionView();
      });
    }
  } catch (error) {
    console.log(error);
  }
};

main();
