// Thumbnail slideshow for project cards.
// Any .project-card-thumb with class "slideshow" cycles its children.
// Videos play for their natural duration (up to 5s); images show for 3s each.

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.project-card-thumb.slideshow').forEach(thumb => {
    const slides = Array.from(thumb.children);
    if (slides.length < 2) return;

    let current = 0;

    // stack all slides, show first
    slides.forEach((s, i) => {
      s.style.position   = 'absolute';
      s.style.inset      = '0';
      s.style.width      = '100%';
      s.style.height     = '100%';
      s.style.objectFit  = 'cover';
      s.style.opacity    = i === 0 ? '1' : '0';
      s.style.transition = 'opacity 0.6s ease';
    });
    thumb.style.position = 'relative';

    function getDuration(slide) {
      if (slide.tagName === 'VIDEO') {
        // wait for metadata, cap at 5s
        return new Promise(resolve => {
          const finish = () => resolve(Math.min(slide.duration || 5, 5) * 1000);
          if (slide.readyState >= 1) finish();
          else slide.addEventListener('loadedmetadata', finish, { once: true });
        });
      }
      return Promise.resolve(3000); // photos: 3s
    }

    async function advance() {
      const next = (current + 1) % slides.length;

      // pre-start next video so it's ready
      if (slides[next].tagName === 'VIDEO') {
        slides[next].currentTime = 0;
        slides[next].play().catch(() => {});
      }

      const holdMs = await getDuration(slides[current]);
      await new Promise(r => setTimeout(r, holdMs));

      // cross-fade
      slides[next].style.opacity = '1';
      slides[current].style.opacity = '0';
      current = next;

      advance();
    }

    // kick off first video if applicable
    if (slides[0].tagName === 'VIDEO') {
      slides[0].play().catch(() => {});
    }

    advance();
  });
});
