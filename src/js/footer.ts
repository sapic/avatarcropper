import { WhatsNewDialog } from './whatsnew'
import { hideElement } from './util'
import { GlobalEvents } from './eventclass'
import { TutorialDialog } from './tutorial'

let tutorial: TutorialDialog

export function showTutorial() {
    tutorial.show()
}

export function doFooterThings() {
    tutorial = new TutorialDialog()
    document.body.appendChild(tutorial.container)
    document.getElementById('link-help').addEventListener('click', () => {
        showTutorial()
    })

    let whatsNew = new WhatsNewDialog()
    document.getElementById('link-whatsNew').addEventListener('click', () => {
        whatsNew.show()
    })
    document.body.appendChild(whatsNew.container)

    document.getElementById('closeFooter').addEventListener('click', () => {
        document.getElementById('container').style.height = '100%'
        document.querySelector<HTMLElement>('.bigOverlay').style.height = '100%'
        hideElement(document.getElementById('footer'))
        GlobalEvents.emitEvent('resize')
    })
}
