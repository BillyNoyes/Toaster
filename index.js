import { createToastComponent } from './toaster.js';

const notifications = [
  {
    text: "Can I have an invoice?",
    author: "Annoying Customer",
    timeAgo: "now",
    src: "https://d3m8mk7e1mf7xn.cloudfront.net/64224402d24ae443b84e744a/1700208280014icon.png",
    id: "1",
  },
  {
    text: "Add my VAT to invoice please",
    author: "Pierre Quiroule",
    timeAgo: "1m",
    src: "https://images.unsplash.com/photo-1708710301724-6121560b6de0?q=80&w=3387&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    id: "2",
  },
  {
    text: "Invoice or refund 😡",
    author: "Elias X.",
    timeAgo: "yesterday",
    src: "https://via.placeholder.com/20",
    id: "3",
  },
  {
    text: "Reason: No invoice provided",
    author: "Stripe Refund ⚠️",
    timeAgo: "now",
    src: "https://via.placeholder.com/320",
    id: "4",
  },
  {
    text: "Schicken Sie mir jetzt eine INVOIZE?",
    author: "Georg Borg",
    timeAgo: "2m",
    src: "https://d3m8mk7e1mf7xn.cloudfront.net/64224402d24ae443b84e744a/1699863293388icon.png",
    id: "5",
  },
]

const config = {
  notifications,
  waitFor: 1000,
  toastEvery: 1500,
  toastDuration: 12000,
};

// toastify(config).init();

const toastComponent = createToastComponent({
  notifications,
  waitFor: 1000,
  toastEvery: 2000,
  toastDuration: 10000,
});

toastComponent.init();