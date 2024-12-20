
$(function () {
    "use strict";

    /*-----------------------------------
     * FIXED  MENU - HEADER
     *-----------------------------------*/
    function menuscroll() {
        var $navmenu = $('.nav-menu');
        if ($(window).scrollTop() > 50) {
            $navmenu.addClass('is-scrolling');
        } else {
            $navmenu.removeClass("is-scrolling");
        }
    }
    menuscroll();
    $(window).on('scroll', function () {
        menuscroll();
    });
    /*-----------------------------------
     * NAVBAR CLOSE ON CLICK
     *-----------------------------------*/

    $('.navbar-nav > li:not(.dropdown) > a').on('click', function () {
        $('.navbar-collapse').collapse('hide');
    });
    /* 
     * NAVBAR TOGGLE BG
     *-----------------*/
    var siteNav = $('#navbar');
    siteNav.on('show.bs.collapse', function (e) {
        $(this).parents('.nav-menu').addClass('menu-is-open');
    })
    siteNav.on('hide.bs.collapse', function (e) {
        $(this).parents('.nav-menu').removeClass('menu-is-open');
    })

    /*-----------------------------------
     * ONE PAGE SCROLLING
     *-----------------------------------*/
    // Select all links with hashes
    $('a[href*="#"]').not('[href="#"]').not('[href="#0"]').not('[data-toggle="tab"]').on('click', function (event) {
        // On-page links
        if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
            // Figure out element to scroll to
            var target = $(this.hash);
            target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
            // Does a scroll target exist?
            if (target.length) {
                // Only prevent default if animation is actually gonna happen
                event.preventDefault();
                $('html, body').animate({
                    scrollTop: target.offset().top
                }, 1000, function () {
                    // Callback after animation
                    // Must change focus!
                    var $target = $(target);
                    $target.focus();
                    if ($target.is(":focus")) { // Checking if the target was focused
                        return false;
                    } else {
                        $target.attr('tabindex', '-1'); // Adding tabindex for elements not focusable
                        $target.focus(); // Set focus again
                    };
                });
            }
        }
    });
    /*-----------------------------------
     * OWL CAROUSEL
     *-----------------------------------*/
    var $testimonialsDiv = $('.testimonials');
    if ($testimonialsDiv.length && $.fn.owlCarousel) {
        $testimonialsDiv.owlCarousel({
            items: 1,
            nav: true,
            dots: false,
            navText: ['<span class="ti-arrow-left"></span>', '<span class="ti-arrow-right"></span>']
        });
    }

    var $galleryDiv = $('.img-gallery');
    if ($galleryDiv.length && $.fn.owlCarousel) {
        $galleryDiv.owlCarousel({
            nav: false,
            center: true,
            loop: true,
            autoplay: true,
            dots: true,
            navText: ['<span class="ti-arrow-left"></span>', '<span class="ti-arrow-right"></span>'],
            responsive: {
                0: {
                    items: 1
                },
                768: {
                    items: 3
                }
            }
        });
    }
}); /* End Fn */






$(document).on('click', '.navbar-nav > li:not(.dropdown) > a', function () {
    $('.navbar-collapse').collapse('hide'); // Cierra el menú
});



function showImage(imageNumber) {
    // Oculta todas las imágenes
    const images = document.querySelectorAll(".carousel-image");
    images.forEach(image => image.classList.remove("active"));

    // Muestra la imagen correspondiente
    const activeImage = document.getElementById(`image${imageNumber}`);
    activeImage.classList.add("active");
}


// Función para expandir o contraer respuestas
function toggleFaq(element) {
    // Si ya está activo, lo desactiva
    if (element.classList.contains('active')) {
        element.classList.remove('active');
    } else {
        // Desactiva todos los demás
        document.querySelectorAll('.faq-item').forEach(item => item.classList.remove('active'));
        // Activa el clic actual
        element.classList.add('active');
    }
}


document.addEventListener('DOMContentLoaded', function () {
    const body = document.body;

    function adjustOffset() {
        if (window.innerWidth <= 768) {
            body.setAttribute('data-offset', '120'); // Altura del menú en móvil
        } else {
            body.setAttribute('data-offset', '0'); // Sin offset en pantallas grandes
        }
    }

    // Ejecutar en carga inicial
    adjustOffset();

    // Escuchar cambios en el tamaño de la ventana
    window.addEventListener('resize', adjustOffset);
});

function showContent(number) {
    // Remover la clase 'active' de todos los botones
    const buttons = document.querySelectorAll('.number-btn');
    buttons.forEach(button => button.classList.remove('active'));

    // Agregar la clase 'active' al botón seleccionado
    const selectedButton = buttons[number - 1]; // Ajusta índice (1 -> índice 0)
    selectedButton.classList.add('active');

    // Ocultar todos los bloques de contenido
    const blocks = document.querySelectorAll('.content-block');
    blocks.forEach(block => block.classList.remove('active'));

    // Ocultar todas las imágenes
    const images = document.querySelectorAll('.carousel-image');
    images.forEach(image => image.classList.remove('active'));

    // Mostrar el bloque de contenido seleccionado
    const selectedBlock = document.getElementById(`content${number}`);
    selectedBlock.classList.add('active');

    // Mostrar la imagen correspondiente
    const selectedImage = selectedBlock.querySelector('.carousel-image');
    if (selectedImage) {
        selectedImage.classList.add('active');
    }
}



