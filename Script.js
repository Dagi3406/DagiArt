/*============ toggle icon navbar =============*/
let menuIcon = document.querySelector('#menu-icon');
let navbar = document.querySelector('.navbar');

menuIcon.onclick = () => {
  menuIcon.classList.toggle('bx-x');
  navbar.classList.toggle('active');
}

/*============ scroll section ovtive link=============*/
let section =document.querySelectorAll('section');
let navLinks =document.querySelectorAll('header nav a');

window.onscroll = () => {
  section.forEach(sec => {
    let top = window.scrollY;
    let offset = sec.offsetTop - 150;
    let height = sec.offsetHeight;
    let id = sec.getAttribute('id');
    
    if(top >= offset && top < offset + height) {
      navLinks.forEach(links => {
        links.classList.remove('active');
        document.querySelector('header nav a[href*=' + id +']').classList.add('active');
      });
    };
  });
  /*============ sticky navbar =============*/
  let header = document.querySelector('header');
  
  header.classList.toggle('sticky', window.scrollY > 100);
  
  /*============ remove toggle icon and navbar when click navbar link (scroLL) =============*/
  menuIcon.classList.remove('bx-x');
  navbar.classList.remove('active');
};

  /*============ scroll reveal =============*/
  ScrollReveal({
    // reset: true,
    distance: '80px',
    duration: 2000,
    delay: 200
  });
  
  ScrollReveal().reveal('.home-content, .heading', { orgin: 'top'});
  ScrollReveal().reveal('.home-img, .Dagi-box, contact form', { origin:'bottom'})
  ScrollReveal().reveal('home-content h1', { origin: 'left'});
  ScrollReveal().reveal('.home-content p', { origin: 'right'});
    /*============ typed js =============con*/
    const typed = new Typed('.multiple-text', {
      strings: ['Painter'],
      typeSpeed: 100,
      backSpeed: 100,
      backDelay: 1000,
      loop: true
    });
    document.addEventListener('DOMContentLoaded', () => {
  // Get the modal
  var modal = document.getElementById("messageModal");

  // Get the button that opens the modal
  var btn = document.querySelector("input[type='submit']");

  // Get the <span> element that closes the modal
  var span = document.getElementsByClassName("close")[0];

  // When the user clicks the button, open the modal 
  btn.onclick = function(event) {
    event.preventDefault(); // Prevent form submission
    modal.style.display = "block";
  }

  // When the user clicks on <span> (x), close the modal
  span.onclick = function() {
    modal.style.display = "none";
  }

  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  }
});