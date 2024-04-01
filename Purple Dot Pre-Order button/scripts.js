let selectedVariant = Tapcart.variables.product.selectedVariant.id;

const apiKey = "<YOUR_API_KEY>";

const instockButton = document.querySelector('#in-stock-button');
const preorderButton = document.querySelector('#preorder-button');
const dispatchDateDiv = document.querySelector('#waitlist-dispatch-date');
const waitlistInfoDiv = document.querySelector('#waitlist-info');
const learnMoreLink = document.querySelector('#learn-more-link');

learnMoreLink.addEventListener('click', () => {
  Tapcart.actions.openScreen({
    destination: { type: "web", url: `https://www.purpledotprice.com/embedded-checkout/pre-order-value-prop?hideBackToProduct=true&isAddToPreorder=false&apiKey=${apiKey}&noModal=true` }
  });
});

async function getPreorderStateForVariant(selectedVariant) {
  const url = new URL("https://www.purpledotprice.com/api/v1/variants/preorder-state");
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set('variant_id', selectedVariant);

  const resp = await fetch(url.toString());
 
  const data = await resp.json();

  if (resp.ok) {
    return {
      state: data.data.state,
      dispatchDate: data.data.waitlist.display_dispatch_date,
    };
  }

  Tapcart.actions.showToast({
    type: "error",
    message: `State response from Purple Dot backend: Error!`,
  });

  return null;
}

async function updatePreorderButtonForSelectedVariant(newSelectedVariant) {
  selectedVariant = newSelectedVariant;

  const { state, dispatchDate }  = await getPreorderStateForVariant(selectedVariant);

  document.querySelector("#preorder-button").style.display =
    state === "ON_PREORDER" ? "block" : "none";

  document.querySelector("#in-stock-button").style.display =
    state === "AVAILABLE_IN_STOCK" ? "block" : "none";

  document.querySelector("#sold-out-button").style.display =
    state === "SOLD_OUT" ? "block" : "none";

  if (state === "ON_PREORDER") {
    dispatchDateDiv.innerHTML = dispatchDate;
    waitlistInfoDiv.style.display = 'block';
  } else {
    dispatchDateDiv.innerHTML = '';
    waitlistInfoDiv.style.display = 'none';
  }
}

updatePreorderButtonForSelectedVariant(Tapcart.variables.product.selectedVariant.id);

Tapcart.registerEventHandler("product/updated", async (eventData) => {
  await updatePreorderButtonForSelectedVariant(eventData.product.selectedVariant.id);
});

preorderButton.addEventListener('click', () => {
  Tapcart.actions.openScreen({
    destination: { type: "web", url: `https://www.purpledotprice.com/embedded/placements/checkout/express?apiKey=${apiKey}&variantId=${selectedVariant}&noModal=true` }
  });
});

instockButton.addEventListener('click', () => {
  Tapcart.actions.addToCart({
    lineItems: [
      {
        variantId: selectedVariant,
        quantity: 1,
      },
    ],
  });
});