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

/*============ SendMail function =============*/

  function SendMail() {
      const spinner = document.getElementById("spinner");
  spinner.style.display = "block"; // Show spinner
    
      var params = {
        from_name: document.getElementById("fullName").value,
        email_id: document.getElementById("email").value,
        phoneNumber: document.getElementById("phoneNumber").value,
        subject: document.getElementById("subject").value,
        message: document.getElementById("message").value,
      };
      emailjs.send("service_at5g52t", "template_wtqxv5m", params).then(function (res) {
        Swal.fire({
          title: 'Success!',
          text: 'Your message has been sent successfully.',
          icon: 'success',
          confirmButtonText: 'OK'
        });
        spinner.style.display = "none"; // Hide spinner
      }).catch(function (err) {
        Swal.fire({
          title: 'Error!',
          text: 'There was an error sending your message.',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      });
    }

// Form submission alert using SweetAlert2
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contact-form');

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const name = form.querySelector('input[placeholder="Full Name"]').value;
    const email = form.querySelector('input[placeholder="Email Address"]').value;
    const mobile = form.querySelector('input[placeholder="Mobile Number"]').value;
    const subject = form.querySelector('input[placeholder="Email Subject"]').value;
    const message = form.querySelector('textarea[placeholder="Your Message"]').value;

    if (!name || !email || !mobile || !subject || !message) {
      Swal.fire({
        title: 'Error!',
        text: 'Please fill in all fields.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } else {
      /*// Swal.fire({
      //   title: 'Success!',
      //   text: 'Your message has been sent successfully.',
      //   icon: 'success',
      //   confirmButtonText: 'OK'
      // }).then(() => {
      //   form.reset(); // Optionally, reset the form fields
      // });*/
       SendMail();
          form.reset(); // Optionally, reset the form fields
    }
  });
});
