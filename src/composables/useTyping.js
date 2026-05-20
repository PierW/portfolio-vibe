import Typed from 'typed.js'

export const typeWithTyped = (selector, htmlString, speed = 20) => {
  return new Promise((resolve, reject) => {
    const el = typeof selector === 'string' ? document.querySelector(selector) : selector
    
    if (!el) {
      reject(new Error(`Element not found: ${selector}`))
      return
    }

    // Clear existing content before typing
    el.innerHTML = ''

    new Typed(el, {
      strings: [htmlString],
      typeSpeed: speed,
      showCursor: false,
      contentType: 'html',
      onComplete: (self) => {
        self.cursor?.remove()
        resolve()
      }
    })
  })
}