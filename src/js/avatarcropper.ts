import { Widget } from './widget'
import { CropView } from './cropview'
import { Previews } from './previews'
import {
    createElement,
    hideElement,
    showElement,
    getIEVersion,
    createOptionElement,
} from './util'
import { LabelSlider } from './labeledslider'
import Storage from './storage'
import { doFooterThings, showTutorial } from './footer'
import { GlobalEvents } from './eventclass'
import { TextDialog } from './textdialog'
import { DragDrop } from './dragdrop'
import { ImagePasted } from './imagepasted'
import { Point } from './point'
import { KeyManager } from './keymanager'
import { Border, GradientInfo } from './borders'
import { Canvas } from './canvas'
import { GradientEditButton } from './gradientedit'

export interface Settings {
    previewSizes: number[]
    maskOpacity: number
    previewMode: 'circle' | 'square'| 'banner'
    outlinesEnabled: boolean
    banneroutlinesEnabled: boolean
    antialias: boolean
    dismissedTutorial: boolean
    dismissedIE: boolean
    dismissedCookie: boolean
    guidesEnabled: boolean
    resizeLock: boolean
    borderSize: number
    borderPresets: GradientInfo[]
}

export class AvatarCropper extends Widget {
    private cropView: CropView
    private previews: Previews

    private menu: HTMLElement
    private openFileLabel: HTMLElement
    private maskOutlineButton: HTMLElement
    private bannerOutlineButton: HTMLElement
    private guidesButton: HTMLElement
    private toggleMenuButton: HTMLElement
    private flipHButton: HTMLElement
    private flipVButton: HTMLElement
    private antialiasButton: HTMLElement
    private textOverlay: HTMLLabelElement
    private borderSelect: HTMLSelectElement;

    private menuToggle: boolean = true
    private firstOpened: boolean = false

    public static readonly settings: Settings = {
        previewSizes: [30, 40, 64, 128],
        maskOpacity: 0.5,
        previewMode: 'circle',
        outlinesEnabled: true,
        banneroutlinesEnabled: false,
        antialias: true,
        dismissedTutorial: false,
        dismissedIE: false,
        dismissedCookie: false,
        guidesEnabled: true,
        resizeLock: false,
        borderSize: 0.05,
        borderPresets: Border.defaults
    }

    constructor(container: HTMLElement) {
        super(container)

        this.loadSettings()
        Border.size = AvatarCropper.settings.borderSize
        console.log(AvatarCropper.settings.borderSize)
        this.constructMenu()
        this.cropView = new CropView(AvatarCropper.settings)
        this.previews = new Previews(this.cropView)

        this.appendChild(this.cropView, this.previews)

        AvatarCropper.settings.previewSizes.forEach(size => {
            this.previews.addPreviewSize(new Point(size))
        })

        this.previews.on('sizeArrayChange', (sizeArray: number[]) => {
            AvatarCropper.settings.previewSizes = sizeArray
            AvatarCropper.saveSettings();
        })

        window.addEventListener('resize', this.handleResize.bind(this))
        this.previews.on('sizechange', this.handleResize.bind(this))
        GlobalEvents.on('resize', this.handleResize.bind(this))

        this.cropView.on('antialiaschange', (antialiased: boolean) => {
            if (antialiased) {
                this.antialiasButton.classList.add('toggled')
            } else {
                this.antialiasButton.classList.remove('toggled')
            }

            AvatarCropper.settings.antialias = antialiased
            AvatarCropper.saveSettings();
        })
        this.handleResize()

        this.textOverlay = <HTMLLabelElement>(
            createElement('label', 'bigOverlay')
        )
        this.textOverlay.innerText = `Drag a File Here\nOr Click to Select`
        this.textOverlay.style.cursor = 'pointer'
        this.textOverlay.style.textAlign = 'center'
        this.textOverlay.setAttribute('for', 'openInput')

        let dragDrop = new DragDrop(this.textOverlay)

        dragDrop.on('drop', file => {
            this.openFile(file)
        })
        dragDrop.on('dragleave', () => {
            if (!this.firstOpened) {
                showElement(this.textOverlay)
            }
        })

        let imagePaste = new ImagePasted(this.textOverlay)
        
        imagePaste.on('imagepasted', file => {
            this.openFile(file)
        })        

        document.body.appendChild(this.textOverlay)

        if (getIEVersion() !== false && !AvatarCropper.settings.dismissedIE) {
            window.alert(
                "hey so your browser isn't really supported ... things should still work but they will be slower/ugly due to how internet explorer/edge function (They don't conform to web standards). i'd recommend switching to firefox or chrome!! but you don't have to if you don't want to. this is the only time you'll see this message unless u clear ur cache or something. ok bye",
            )

            AvatarCropper.settings.dismissedIE = true
            AvatarCropper.saveSettings();
        }
    }

    public loadFromFile(file: File): void {
        this.cropView.setImageFromFile(file)
    }

    public static saveSettings() {
        Storage.set('settings', AvatarCropper.settings)
    }

    private loadSettings() {
        let s = Storage.get('settings', {})

        for (let key in AvatarCropper.settings) {
            if (s.hasOwnProperty(key)) {
                if (s[key] !== null) {
                    AvatarCropper.settings[key] = s[key]
                }
            }
        }

        AvatarCropper.saveSettings();
    }

    private constructMenu(): void {
        this.menu = createElement('div', 'menu')

        // create render button //
        let render = createElement('button', 'item render show')
        render.innerText = 'Download'
        render.addEventListener('click', this.renderCroppedImage.bind(this))
        this.menu.appendChild(render)

        let rendershadow = createElement('div', 'renderShadow show')
        this.menu.appendChild(rendershadow)

        let openFile = <HTMLInputElement>(
            createElement('input', 'openInput show')
        )
        openFile.id = 'openInput'
        openFile.type = 'file'
        openFile.addEventListener('change', e => {
            if (openFile.files && openFile.files[0]) {
                this.openFile(openFile.files[0])
            }
        })

        this.openFileLabel = createElement('label', 'open half item show lefthalf')
        this.openFileLabel.innerText = 'Open File...'
        this.openFileLabel.appendChild(openFile)
        this.menu.appendChild(this.openFileLabel)

        this.toggleMenuButton = createElement('button', 'half item show righthalf')
        this.toggleMenuButton.setAttribute('uptext', 'Collapse Menu')
        this.toggleMenuButton.setAttribute('downtext', '▼')
        this.toggleMenuButton.innerText = this.toggleMenuButton.getAttribute(
            'uptext',
        )
        this.toggleMenuButton.addEventListener(
            'click',
            this.toggleMenu.bind(this),
        )
        this.menu.appendChild(this.toggleMenuButton)

        let circle = createElement('button', 'open item half shapeToggle lefthalf')
        let square = createElement('button', 'open item half shapeToggle righthalf')
        circle.innerText = 'Circle'
        square.innerText = 'Squaré'
        circle.classList.toggle("toggled", AvatarCropper.settings.previewMode === "circle");
        square.classList.toggle("toggled", AvatarCropper.settings.previewMode === "square");
        circle.addEventListener('click', () => {
            circle.classList.add('toggled')
            square.classList.remove('toggled')
            AvatarCropper.settings.previewMode = 'circle'
            this.cropView && this.cropView.update("circle toggle") // will update previews as well
            AvatarCropper.saveSettings();
        })
        square.addEventListener('click', () => {
            circle.classList.remove('toggled')
            square.classList.add('toggled')
            AvatarCropper.settings.previewMode = 'square'
            this.cropView && this.cropView.update("square toggle") // will update previews as well
            AvatarCropper.saveSettings();
        })
        this.menu.appendChild(circle)
        this.menu.appendChild(square)

        this.bannerOutlineButton = createElement('button', 'item')
        this.bannerOutlineButton.innerText = 'Discord Banner Guidelines'
        this.bannerOutlineButton.addEventListener('click',
            this.toggleBannerOutline.bind(this)
        )
        this.toggleBannerOutline(false)
        this.menu.appendChild(this.bannerOutlineButton)

        this.maskOutlineButton = createElement('button', 'item')
        this.maskOutlineButton.innerText = 'Avatar Guidelines'
        this.maskOutlineButton.addEventListener(
            'click',
            this.toggleMaskOutline.bind(this, true),
        )
        this.toggleMaskOutline(false)
        this.menu.appendChild(this.maskOutlineButton)
        

        let tSlider = new LabelSlider(
            0,
            1,
            0.01,
            'Mask Transparency',
            'item transparency',
        )
        tSlider.on('slide', this.setTransparency.bind(this))
        tSlider.on('change', () => AvatarCropper.saveSettings());
        tSlider.value = 1 - AvatarCropper.settings.maskOpacity
        this.menu.appendChild(tSlider.container)

        let zoomBar = createElement('div', 'item zoomBar zoomLabel')
        let zoomLabel = createElement('div', 'zoomLabel zoomText')
        zoomLabel.innerText = 'Zoom:'
        zoomBar.appendChild(zoomLabel)
        let zoomOut = createElement('button', 'zoomOut')
        zoomOut.innerText = '-'
        zoomOut.addEventListener('click', () => this.cropView.zoomOut())
        let zoomIn = createElement('button', 'zoomIn')
        zoomIn.innerText = '+'
        zoomIn.addEventListener('click', () => this.cropView.zoomIn())
        let zoomFit = createElement('button', 'zoomFit')
        zoomFit.innerText = 'Fit'
        zoomFit.addEventListener('click', () => this.cropView.zoomFit())
        zoomBar.appendChild(zoomFit)
        zoomBar.appendChild(zoomIn)
        zoomBar.appendChild(zoomOut)
        this.menu.appendChild(zoomBar)

        let rSlider = new LabelSlider(-180, 180, 1, 'Rotation', 'item rotation')
        rSlider.on('slide', (deg: number) => {
            if (Math.abs(deg - 90) <= 2) {
                deg = 90
            } else if (Math.abs(deg + 90) <= 2) {
                deg = -90
            } else if (Math.abs(deg) <= 2) {
                deg = 0
            } else if (Math.abs(deg - 180) <= 2) {
                deg = 180
            } else if (Math.abs(deg + 180) <= 2) {
                deg = -180
            }

            this.setRotation(deg)
        })
        rSlider.value = 0
        this.menu.appendChild(rSlider.container)

        this.flipHButton = createElement('button', 'half item lefthalf')
        this.flipHButton.innerText = 'Flip Horiz.'
        this.flipHButton.addEventListener(
            'click',
            this.flipHorizontal.bind(this),
        )
        this.menu.appendChild(this.flipHButton)

        this.flipVButton = createElement('button', 'half item righthalf')
        this.flipVButton.innerText = 'Flip Vertical'
        this.flipVButton.addEventListener('click', this.flipVertical.bind(this))
        this.menu.appendChild(this.flipVButton)


        let addPreview = createElement('button', 'half item lefthalf')
        addPreview.innerText = 'Add Preview'
        addPreview.addEventListener('click', this.promptAddPreview.bind(this))
        this.menu.appendChild(addPreview)

        this.guidesButton = createElement('button', 'half item righthalf')
        this.guidesButton.innerText = 'Guidelines'
        this.guidesButton.addEventListener(
            'click',
            this.toggleGuides.bind(this, true),
        )
        this.toggleGuides(false)
        this.menu.appendChild(this.guidesButton)

        let centerCropArea = createElement('button', 'half item lefthalf')
        centerCropArea.innerText = 'Center'
        centerCropArea.addEventListener('click', this.centerCropArea.bind(this))
        this.menu.appendChild(centerCropArea)
        
        this.antialiasButton = createElement('button', 'half item righthalf')
        this.antialiasButton.innerText = 'Antialias'
        this.antialiasButton.addEventListener('click', () => {
            this.cropView.antialias = !this.cropView.antialias
        })
        if (AvatarCropper.settings.antialias) {
            this.antialiasButton.classList.add('toggled')
        }
        this.menu.appendChild(this.antialiasButton)

        let setCropSize = createElement('button', 'half item lefthalf')
        setCropSize.innerText = 'Set Size'
        setCropSize.addEventListener('click', this.setCropSize.bind(this))
        this.menu.appendChild(setCropSize)

        let lock = createElement('button', 'half item righthalf')
        lock.innerText = 'Lock Center During Resize'
        lock.addEventListener('click', this.toggleResizeLock.bind(this))
        this.menu.appendChild(lock)
        GlobalEvents.on('resizelockchange', () => {
            if (AvatarCropper.settings.resizeLock) {
                lock.classList.add('toggled')
            } else {
                lock.classList.remove('toggled')
            }
        })
        GlobalEvents.emitEvent('resizelockchange')

        // create border options //
        this.borderSelect = <HTMLSelectElement>createElement('select', 'item');
        this.borderSelect.id = "borderSelect";
        this.menu.appendChild(this.borderSelect);

        let populateBorder = () => {
            let len = this.borderSelect.options.length;
            for (let i = 0; i < len; i++) {
                this.borderSelect.options.remove(0);
            }

            this.borderSelect.add(createOptionElement("No Border", "none"));
            this.borderSelect.add(createOptionElement("Solid Border", "solid"));
            AvatarCropper.settings.borderPresets.forEach((preset) => {
                this.borderSelect.add(createOptionElement(preset.name, JSON.stringify(preset)));
            });
            this.borderSelect.add(createOptionElement("Custom Gradient Border", "gradient"));
        };

        populateBorder();

        let borderSolidEdit = createElement("input", "item borderEdit") as HTMLInputElement;
        borderSolidEdit.type = "color";
        borderSolidEdit.value = Border.color;
        borderSolidEdit.addEventListener("change", () => {
            Border.color = borderSolidEdit.value;
        });
        hideElement(borderSolidEdit);
        this.menu.appendChild(borderSolidEdit);

        let borderGradientEdit = new GradientEditButton(new Point(32));
        borderGradientEdit.gradient = Border.gradient;
        borderGradientEdit.container.className = "item borderEdit";
        borderGradientEdit.on("update", (gradientInfo: GradientInfo) => {
            borderGradientEdit.gradient = gradientInfo;
            Border.gradient = gradientInfo;
            populateBorder();
            this.borderSelect.selectedIndex = this.borderSelect.options.length - 1;
        });
        borderGradientEdit.hide();
        this.menu.appendChild(borderGradientEdit.container);

        this.borderSelect.addEventListener('change', () => {
            if (this.borderSelect.value === "solid") {
                showElement(borderSolidEdit);
                borderGradientEdit.hide();
                this.borderSelect.classList.add("edit");
                Border.type = "solid";
            } else if (this.borderSelect.value === "gradient") {
                hideElement(borderSolidEdit);
                borderGradientEdit.show();
                this.borderSelect.classList.add("edit");
                Border.type = "gradient";
            } else if (this.borderSelect.value === "none") {
                hideElement(borderSolidEdit);
                borderGradientEdit.hide();
                this.borderSelect.classList.remove("edit");
                Border.type = "none";
            } else {
                hideElement(borderSolidEdit);
                borderGradientEdit.hide();
                this.borderSelect.classList.remove("edit");
                Border.type = "gradient";
                Border.gradient = JSON.parse(this.borderSelect.selectedOptions[0].value);
                borderGradientEdit.gradient = Border.gradient;
            }
        });

        // create border slider //
        let borderSlider = new LabelSlider(0, 0.5, 0.01, 'Border Size', 'item')
        borderSlider.value = Border.size
        borderSlider.on('slide', (value: number) => {
            Border.size = value
        })
        borderSlider.on('change', () => {
            AvatarCropper.settings.borderSize = borderSlider.value
            AvatarCropper.saveSettings();
        })
        this.menu.appendChild(borderSlider.container)

        this.appendChild(this.menu)
    }

    private flipHorizontal(): void {
        this.cropView.flipHorizontal()
    }

    private flipVertical(): void {
        this.cropView.flipVertical()
    }

    private centerCropArea(): void {
        this.cropView.centerCropArea()
    }

    private setCropSize(): void {
        let promptStr =
            'The Current Size is ' +
            this.cropView.innerSize.x.toString() +
            'x' +
            this.cropView.innerSize.y.toString() +
            '\n' +
            'The Current Crop Area is ' +
            this.cropView.cropArea.width +
            'x' +
            this.cropView.cropArea.height +
            '\n' +
            'Enter in a size either by specifying a number (like 64) or a percentage of width (50%w) or height (50%h)'

        let sizeStr = window.prompt(promptStr)
        if (sizeStr === null || isNaN(parseInt(sizeStr))) {
            return
        }

        let size = parseInt(sizeStr)

        if (sizeStr.endsWith('%w')) {
            size = this.cropView.innerSize.x * (size / 100)
        } else if (sizeStr.endsWith('%h')) {
            size = this.cropView.innerSize.y * (size / 100)
        }

        this.cropView.setCropSize(size)
    }

    private toggleResizeLock(): void {
        AvatarCropper.settings.resizeLock = !AvatarCropper.settings.resizeLock
        AvatarCropper.saveSettings();
        GlobalEvents.emitEvent('resizelockchange')
    }

    private toggleMenu(): void {
        if (this.menuToggle) {
            // showing, need to hide //
            Array.from(this.menu.children).forEach(child => {
                if (!child.classList.contains('show')) {
                    (<HTMLElement>child).style.display = 'none';
                }
            });

            this.toggleMenuButton.classList.add('toggled')
            this.toggleMenuButton.innerText = this.toggleMenuButton.getAttribute(
                'downtext',
            )
        } else {
            Array.from(this.menu.children).forEach(child => {
                (<HTMLElement>child).style.display = '';
            });

            hideElement(document.querySelector("input.borderEdit"));
            hideElement(document.querySelector("canvas.borderEdit"));

            if (this.borderSelect.value === "solid") {
                showElement(document.querySelector("input.borderEdit"));
            } else if (this.borderSelect.value === "gradient") {
                showElement(document.querySelector("canvas.borderEdit"));
            }

            this.toggleMenuButton.classList.remove('toggled')
            this.toggleMenuButton.innerText = this.toggleMenuButton.getAttribute(
                'uptext',
            )
        }

        this.menuToggle = !this.menuToggle
    }

    private renderCroppedImage(): void {
        this.cropView.renderCroppedImage()
    }

    private toggleMaskOutline(actuallyToggle: boolean = true): void {
        if (actuallyToggle) {
            if (AvatarCropper.settings.banneroutlinesEnabled) {
                AvatarCropper.settings.banneroutlinesEnabled = false
            }
            AvatarCropper.settings.outlinesEnabled = !AvatarCropper.settings.outlinesEnabled
            this.toggleBannerOutline(false)
        }

        if (AvatarCropper.settings.outlinesEnabled) {
            this.maskOutlineButton.classList.add('toggled')
        } else {
            this.maskOutlineButton.classList.remove('toggled')
        }

        //this.cropView && this.cropView.update("mask outline")
        AvatarCropper.saveSettings();
    }

    private toggleBannerOutline(actuallyToggle: boolean = true): void {
        if (actuallyToggle) {
            if (AvatarCropper.settings.outlinesEnabled) {
                AvatarCropper.settings.outlinesEnabled = false
            }
            AvatarCropper.settings.banneroutlinesEnabled = !AvatarCropper.settings.banneroutlinesEnabled
            this.toggleMaskOutline(false)
        }

        if (AvatarCropper.settings.banneroutlinesEnabled) {
            this.bannerOutlineButton.classList.add('toggled')
        } else {
            this.bannerOutlineButton.classList.remove('toggled')
        }

        this.cropView && this.cropView.update("mask outline")
        AvatarCropper.saveSettings();
    }


    private toggleGuides(actuallyToggle: boolean = true): void {
        if (actuallyToggle) {
            AvatarCropper.settings.guidesEnabled = !AvatarCropper.settings.guidesEnabled
        }

        if (AvatarCropper.settings.guidesEnabled) {
            this.guidesButton.classList.add('toggled')
        } else {
            this.guidesButton.classList.remove('toggled')
        }

        this.cropView && this.cropView.update("guide toggle")
        AvatarCropper.saveSettings();
    }

    private setTransparency(transparency: number): void {
        AvatarCropper.settings.maskOpacity = 1 - transparency
        this.cropView.update("set transparenty")
    }

    private setRotation(deg: number): void {
        this.cropView.rotate(deg)
    }

    private promptAddPreview(): void {
        let sizeStr = window.prompt(
            'Enter a Custom Size\nDefault sizes are: 30, 40, 64, and 128.\nNote: 30 will come with a Discord online indicator.',
        )

        if (sizeStr === null) {
            // cancelled
            return
        }

        let size = parseInt(sizeStr)

        if (isNaN(size) || size <= 0) {
            alert("Please, dear god, enter a size above 0...")
        } else {
            this.previews.addPreviewSize(new Point(size)) // emits sizeArrayChange event which changes settings so dw
        }
    }

    private openFile(file: File): void {
        if (!this.cropView.setImageFromFile(file)) {
            return
        }

        if (!this.firstOpened) {
            this.firstOpened = true
            this.show()
            hideElement(this.textOverlay)
            this.textOverlay.removeAttribute('for')
            this.textOverlay.style.cursor = ''
        }

        if (this.cropView.currentFileType === 'gif') {
            hideElement(this.flipHButton)
            hideElement(this.flipVButton)
        } else {
            showElement(this.flipHButton)
            showElement(this.flipVButton)
        }

        if (
            !AvatarCropper.settings.dismissedTutorial ||
            !AvatarCropper.settings.dismissedCookie
        ) {
            showTutorial()
            AvatarCropper.settings.dismissedTutorial = true
            AvatarCropper.settings.dismissedCookie = true
            AvatarCropper.saveSettings();
        }
    }

    private handleResize(): void {
        let sideWidth = Math.max(
            this.previews.width,
            this.menu.getBoundingClientRect().width,
        )
        this.cropView.container.style.width = 'calc(100% - ' + sideWidth + 'px)'
        this.cropView.reactTMToRefresh()

        let previewHeight = this.previews.height + this.previews.padding * 2
        //this.menu.style.height = "calc(100% - " + previewHeight + "px)";
    }
}

window.addEventListener('load', function() {
    KeyManager.initialize();
    (<any>window).a = new AvatarCropper(document.getElementById('container'));
    doFooterThings();
})
