import { Widget } from "./widget";
import { CropView } from "./cropview";
import { Previews } from "./previews";
import { createElement, hideElement, showElement, getIEVersion, Point } from "./util";
import { LabelSlider } from "./labeledslider";
import Storage from "./storage";
import { doFooterThings, showTutorial } from "./footer";
import { GlobalEvents } from "./eventclass";
import { TextDialog } from "./textdialog";
import { DragDrop } from "./dragdrop";

export interface Settings
{
    previewSizes : number[],
    maskOpacity : number;
    previewMode : "circle" | "square";
    outlinesEnabled : boolean;
    antialias : boolean;
    dismissedTutorial : boolean;
    dismissedIE : boolean;
    dismissedCookie : boolean;
}

export class AvatarCropper extends Widget
{
    private cropView : CropView;
    private previews : Previews;

    private menu : HTMLElement;
    private openFileLabel : HTMLElement;
    private maskOutlineButton : HTMLElement;
    private toggleMenuButton : HTMLElement;
    private flipHButton : HTMLElement;
    private flipVButton : HTMLElement;
    private antialiasButton : HTMLElement;
    private textOverlay : HTMLLabelElement;

    private menuToggle : boolean = true;
    private firstOpened : boolean = false;

    private settings : Settings = {
        previewSizes: [ 30, 40, 64, 128 ],
        maskOpacity: 0.5,
        previewMode: "circle",
        outlinesEnabled: true,
        antialias: true,
        dismissedTutorial: false,
        dismissedIE: false,
        dismissedCookie: false
    };

    constructor(container : HTMLElement)
    {
        super(container);

        this.loadSettings();
        this.constructMenu();
        this.cropView = new CropView(this.settings);
        this.previews = new Previews(this.cropView);

        this.appendChild(this.cropView, this.previews);
        
        this.settings.previewSizes.forEach(size =>
        {
            this.previews.addPreviewSize(new Point(size));
        });

        this.previews.on("sizeArrayChange", (sizeArray : number[]) =>
        {
            this.settings.previewSizes = sizeArray;
            this.saveSettings();
        });

        window.addEventListener("resize", this.handleResize.bind(this));
        this.previews.on("sizechange", this.handleResize.bind(this));
        GlobalEvents.on("resize", this.handleResize.bind(this));
        
        this.cropView.on("antialiaschange", (antialiased : boolean) =>
        {
            if (antialiased)
            {
                this.antialiasButton.classList.add("toggled");
            }
            else
            {
                this.antialiasButton.classList.remove("toggled");
            }

            this.settings.antialias = antialiased;
            this.saveSettings();
        });
        this.handleResize();

        this.textOverlay = <HTMLLabelElement>createElement("label", "bigOverlay");
        this.textOverlay.innerText = "Open file";
        this.textOverlay.style.cursor = "pointer";
        this.textOverlay.setAttribute("for", "openInput");

        let dragDrop = new DragDrop(this.textOverlay);
        dragDrop.on("drop", (file) =>
        {
            this.openFile(file);
        });
        dragDrop.on("dragleave", () =>
        {
            if (!this.firstOpened)
            {
                showElement(this.textOverlay);
            }
        });

        this.appendChild(this.textOverlay);

        if (getIEVersion() !== false && !this.settings.dismissedIE)
        {
            window.alert("hey so your browser isn't really supported ... things should still work but they will be slower/ugly due to how internet explorer/edge function (They don't conform to web standards). i'd recommend switching to firefox or chrome!! but you don't have to if you don't want to. this is the only time you'll see this message unless u clear ur cache or something. ok bye");

            this.settings.dismissedIE = true;
            this.saveSettings();
        }
    }

    public loadFromFile(file : File) : void
    {
        this.cropView.setImageFromFile(file);
    }

    private saveSettings()
    {
        Storage.set("settings", this.settings);
    }

    private loadSettings()
    {
        let s = Storage.get("settings", {});

        for (let key in this.settings)
        {
            if (s.hasOwnProperty(key))
            {
                this.settings[key] = s[key];
            }
        }

        this.saveSettings();
    }

    private constructMenu() : void
    {
        this.menu = createElement("div", "menu");

        let openFile = <HTMLInputElement>createElement("input", "openInput show");
        openFile.id = "openInput";
        openFile.type = "file";
        openFile.addEventListener("change", (e) =>
        {
            if (openFile.files && openFile.files[0])
            {
                this.openFile(openFile.files[0]);
            }
        });

        this.openFileLabel = createElement("label", "open half item show");
        this.openFileLabel.innerText = "Open File...";
        this.openFileLabel.appendChild(openFile);
        this.menu.appendChild(this.openFileLabel);

        this.toggleMenuButton = createElement("button", "half item show");
        this.toggleMenuButton.setAttribute("uptext", "Collapse Menu");
        this.toggleMenuButton.setAttribute("downtext", "▼");
        this.toggleMenuButton.innerText = this.toggleMenuButton.getAttribute("uptext");
        this.toggleMenuButton.addEventListener("click", this.toggleMenu.bind(this));
        this.menu.appendChild(this.toggleMenuButton);

        let circle = createElement("button", "open item half");
        circle.innerText = "Circle";
        let square = createElement("button", "open item half");
        square.innerText = "Sqauarare";
        circle.addEventListener("click", () =>
        {
            circle.classList.add("toggled");
            square.classList.remove("toggled");
            this.settings.previewMode = "circle";
            this.cropView && this.cropView.refresh(); // will update previews as well
            this.saveSettings();
        });
        square.addEventListener("click", () =>
        {
            circle.classList.remove("toggled");
            square.classList.add("toggled");
            this.settings.previewMode = "square";
            this.cropView && this.cropView.refresh(); // will update previews as well
            this.saveSettings();
        });
        this.menu.appendChild(circle);
        this.menu.appendChild(square);
        
        if (this.settings.previewMode === "circle")
        {
            circle.click();
        }
        else
        {
            square.click();
        }

        let tSlider = new LabelSlider(0, 1, 0.01, "Mask Transparency", "item transparency");
        tSlider.on("slide", this.setTransparency.bind(this));
        tSlider.on("change", this.saveSettings.bind(this));
        tSlider.value = 1 - this.settings.maskOpacity;
        this.menu.appendChild(tSlider.container);

        let zoomBar = createElement("div", "item zoomBar");
        let zoomLabel = createElement("div", "zoomLabel");
        zoomLabel.innerText = "Zoom:";
        zoomBar.appendChild(zoomLabel);
        let zoomOut = createElement("button", "zoomOut");
        zoomOut.innerText = "-";
        zoomOut.addEventListener("click", () => this.cropView.zoomOut());
        let zoomIn = createElement("button", "zoomIn");
        zoomIn.innerText = "+";
        zoomIn.addEventListener("click", () => this.cropView.zoomIn());
        let zoomFit = createElement("button", "zoomFit");
        zoomFit.innerText = "Fit";
        zoomFit.addEventListener("click", () => this.cropView.zoomFit());
        zoomBar.appendChild(zoomFit);
        zoomBar.appendChild(zoomIn);
        zoomBar.appendChild(zoomOut);
        this.menu.appendChild(zoomBar);
        
        let rSlider = new LabelSlider(-180, 180, 1, "Rotation", "item rotation");
        rSlider.on("slide", (deg : number) =>
        {        
            if (Math.abs(deg - 90) <= 2) {
                deg = 90;
            } else if (Math.abs(deg + 90) <= 2) {
                deg = -90;
            } else if (Math.abs(deg) <= 2) {
                deg = 0;
            } else if (Math.abs(deg - 180) <= 2) {
                deg = 180;
            } else if (Math.abs(deg + 180) <= 2) {
                deg = -180;
            }
            
            this.setRotation(deg);
        });
        rSlider.value = 0;
        this.menu.appendChild(rSlider.container);

        this.flipHButton = createElement("button", "half item");
        this.flipHButton.innerText = "Flip Horiz.";
        this.flipHButton.addEventListener("click", this.flipHorizontal.bind(this));
        this.menu.appendChild(this.flipHButton);

        this.flipVButton = createElement("button", "half item");
        this.flipVButton.innerText = "Flip Vertical";
        this.flipVButton.addEventListener("click", this.flipVertical.bind(this));
        this.menu.appendChild(this.flipVButton);

        this.antialiasButton = createElement("button", "half item");
        this.antialiasButton.innerText = "Antialias";
        this.antialiasButton.addEventListener("click", () =>
        {
            this.cropView.antialias = !this.cropView.antialias;
        });
        if (this.settings.antialias)
        {
            this.antialiasButton.classList.add("toggled");
        }
        this.menu.appendChild(this.antialiasButton);

        this.maskOutlineButton = createElement("button", "half item");
        this.maskOutlineButton.innerText = "Mask Outline";
        this.maskOutlineButton.addEventListener("click", this.toggleMaskOutline.bind(this, true));
        this.toggleMaskOutline(false);
        this.menu.appendChild(this.maskOutlineButton);

        let addPreview = createElement("button", "item");
        addPreview.innerText = "Add Preview Size";
        addPreview.addEventListener("click", this.promptAddPreview.bind(this));
        this.menu.appendChild(addPreview);

        let render = createElement("button", "item render show");
        render.innerText = "Render/Save";
        render.addEventListener("click", this.renderCroppedImage.bind(this));
        this.menu.appendChild(render);

        this.appendChild(this.menu);
    }

    private flipHorizontal() : void
    {
        this.cropView.flipHorizontal();
    }

    private flipVertical() : void
    {
        this.cropView.flipVertical();
    }

    private toggleMenu() : void
    {
        if (this.menuToggle)
        {
            // showing, need to hide //
            Array.from(this.menu.children).forEach(child =>
            {
                if (!child.classList.contains("show"))
                {
                    (<HTMLElement>child).style.display = "none";
                }
            });

            this.toggleMenuButton.classList.add("toggled");
            this.toggleMenuButton.innerText = this.toggleMenuButton.getAttribute("downtext");
        }
        else
        {
            Array.from(this.menu.children).forEach(child =>
            {
                (<HTMLElement>child).style.display = "";
            });

            this.toggleMenuButton.classList.remove("toggled");
            this.toggleMenuButton.innerText = this.toggleMenuButton.getAttribute("uptext");
        }

        this.menuToggle = !this.menuToggle;
    }

    private renderCroppedImage() : void
    {
        this.cropView.renderCroppedImage();
    }

    private toggleMaskOutline(actuallyToggle : boolean = true) : void
    {
        if (actuallyToggle)
        {
            this.settings.outlinesEnabled = !this.settings.outlinesEnabled;
        }

        if (this.settings.outlinesEnabled)
        {
            this.maskOutlineButton.classList.add("toggled");
        }
        else
        {
            this.maskOutlineButton.classList.remove("toggled");
        }

        this.cropView && this.cropView.refresh();
        this.saveSettings();
    }

    private setTransparency(transparency : number) : void
    {
        this.settings.maskOpacity = 1 - transparency;
        this.cropView.refresh();
    }

    private setRotation(deg : number) : void
    {
        this.cropView.rotate(deg);
    }

    private promptAddPreview() : void
    {
        let sizeStr = window.prompt("Enter a custom size\nDefault sizes are 30, 40, 64, and 128\nNote: 30 will come with a discord online indicator");

        if (sizeStr === null) // cancelled
        {
            return;
        }

        let size = parseInt(sizeStr);

        if (isNaN(size) || size <= 0)
        {
            alert("Bad size make sure it's a number over 0");
        }
        else
        {
            this.previews.addPreviewSize(new Point(size)); // emits sizeArrayChange event which changes settings so dw
        }
    }

    private openFile(file : File) : void
    {
        if (!this.cropView.setImageFromFile(file))
        {
            return;
        }

        if (!this.firstOpened)
        {
            this.firstOpened = true;
            this.show();
            hideElement(this.textOverlay);
            this.textOverlay.removeAttribute("for");
            this.textOverlay.style.cursor = "";
        }

        if (this.cropView.currentFileType === "gif")
        {
            hideElement(this.flipHButton);
            hideElement(this.flipVButton);
        }
        else
        {
            showElement(this.flipHButton);
            showElement(this.flipVButton);
        }

        if (!this.settings.dismissedTutorial || !this.settings.dismissedCookie)
        {
            showTutorial();
            this.settings.dismissedTutorial = true;
            this.settings.dismissedCookie = true;
            this.saveSettings();
        }
    }

    private handleResize() : void
    {
        let sideWidth = Math.max(this.previews.width, this.menu.getBoundingClientRect().width);
        this.cropView.container.style.width = "calc(100% - " + sideWidth + "px)";
        this.cropView.reactTMToRefresh();

        let previewHeight = this.previews.height + this.previews.padding * 2;
        //this.menu.style.height = "calc(100% - " + previewHeight + "px)";
    }
}

doFooterThings();
(<any>window).a = new AvatarCropper(document.getElementById("container"));