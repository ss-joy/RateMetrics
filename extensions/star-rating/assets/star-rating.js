import { createApp } from "./vue-source.js";

const app = createApp({
  data() {
    return {
      hoveredRating: 0,
      selectedRating: 0,
      productId: null,
      userId: null,
      shopId: null,
      shopDomain: null,
      baseUrl: "https://tigers-streets-failure-stream.trycloudflare.com",
    };
  },
  methods: {
    setHover(index) {
      this.hoveredRating = index;
    },
    clearHover() {
      this.hoveredRating = 0;
    },
    async setRating(index) {
      this.selectedRating = index;

      if (!this.userId) {
        alert("You are not logged in. Cannot submit rating.");
        console.warn("User is not logged in. Cannot submit rating.");
        return;
      }

      try {
        const res = await fetch(`${this.baseUrl}/api/product-rating`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: parseInt(this.userId),
            productId: parseInt(this.productId),
            shopId: parseInt(this.shopId),
            shopDomain: this.shopDomain,
            rateValue: index,
          }),
        });

        const data = await res.json();
        console.log("Rating submitted successfully:", data);
        await this.fetchRating();
        alert("Rating submitted successfully");
      } catch (err) {
        alert(
          "Failed to submit rating. Something went wrong. Please try again",
        );
        console.log("Failed to submit rating", err);
      }
    },
    getFillColor(index) {
      if (this.hoveredRating >= index) {
        return "black";
      } else if (!this.hoveredRating && this.selectedRating >= index) {
        return "black";
      } else {
        return "white";
      }
    },
    async fetchRating() {
      try {
        const response = await fetch(
          `${this.baseUrl}/api/product-rating?productId=${this.productId}`,
        );
        const data = await response.json();
        this.selectedRating = data;
      } catch (err) {
        console.log("Failed to fetch rating", err);
      }
    },
  },
  mounted() {
    const el = document.getElementById("vue-app");
    this.productId = el.dataset.productId;
    this.userId = el.dataset.customerId;
    this.shopId = el.dataset.shopId;
    this.shopDomain = el.dataset.shopDomain;

    if (this.productId) {
      this.fetchRating();
    }
  },
  template: `
    <div style="display: flex; gap: 4px; cursor: pointer;">
      <svg
        v-for="i in 5"
        :key="i"
        v-on:mouseover="setHover(i)"
        v-on:mouseleave="clearHover"
        v-on:click="setRating(i)"
        xmlns="http://www.w3.org/2000/svg"
        width="24" height="24" viewBox="0 0 24 24"
        v-bind:fill="getFillColor(i)" stroke="black" stroke-width="2"
      >
        <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.782 1.4 8.172L12 18.896l-7.334 3.868 1.4-8.172L.132 9.21l8.2-1.192z"/>
      </svg>
    </div>
  `,
});

app.mount("#vue-app");
