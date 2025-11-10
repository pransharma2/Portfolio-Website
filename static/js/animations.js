// static/js/animations.js
document.addEventListener("DOMContentLoaded", () => {
    const menuItems = document.querySelectorAll(".menu-list li");
  
    menuItems.forEach((item, index) => {
      item.style.opacity = 0;
      setTimeout(() => {
        item.style.transform = "translateY(0)";
        item.style.opacity = 1;
        item.style.transition = "all 0.6s ease";
      }, 300 * index);
    });
  });