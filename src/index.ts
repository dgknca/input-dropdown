import Keywalk from 'keywalk'
import { onWalkFunction, onSelectFunction } from './types'
import './style.scss'

import {
  CSS_CLASS_PREFIX,
  DROPDOWN_CONTAINER_CLASS,
  DROPDOWN_ITEM_CLASS,
  DROPDOWN_ITEM_ICON_CLASS,
  DROPDOWN_ITEM_TITLE_CLASS,
  DROPDOWN_ITEM_SUBTITLE_CLASS
} from './constants'

interface IDataAliases {
  icon?: string
  title?: string
  subtitle?: string
}

interface IConstructorArgs {
  selector: string
  dropdownWidth?: string
  dropdownClass?: string
  data?: any[]
  dataAliases: IDataAliases
  onWalk?: onWalkFunction
  onSelect?: onSelectFunction
  useKeywalk?: boolean
}

interface IProperties {
  inputHeight: number
  inputWidth: number
  inputLeft: number
  inputTop: number
  input: HTMLInputElement
  dropdown: HTMLElement
  dropdownSpecificClass: string
  isDropdownInserted: boolean
  keywalkInstance: Keywalk
}

declare const window: any
export default class InputDropdown implements IProperties {
  args: IConstructorArgs
  selector: string
  data?: any[]
  dataAliases: IDataAliases
  input!: HTMLInputElement
  inputHeight!: number
  inputWidth!: number
  inputLeft!: number
  inputTop!: number
  dropdown!: HTMLElement
  dropdownSpecificClass: string
  dropdownWidth: string
  dropdownClass: string
  useKeywalk: boolean
  isDropdownInserted: boolean
  keywalkInstance: Keywalk

  constructor(args: IConstructorArgs) {
    const {
      selector,
      data,
      dataAliases,
      dropdownWidth,
      dropdownClass,
      useKeywalk = false
    } = args

    this.args = args
    this.selector = selector
    this.dropdownWidth = dropdownWidth
    this.dropdownClass = dropdownClass
    this.data = data
    this.dataAliases = dataAliases
    this.useKeywalk = useKeywalk
    this.isDropdownInserted = false
    this.dropdownSpecificClass = `inpd-dropdown-container-${Math.random()
      .toString(36)
      .substr(2, 5)}`

    this.initInput()
    this.initDropdown()

    document.addEventListener('click', (ev: Event) => {
      this.detectOnFocusInput(ev.target as HTMLElement)
      this.detectOnBlurInputOrDropdown(ev.target as HTMLElement)
    })
  }

  private initInput(): void {
    this.input = document.querySelector(this.selector) as HTMLInputElement

    // get the position after window loaded to avoid layout shifting
    window.addEventListener('load', () => {
      this.setInputPosition()
    })
    window.addEventListener('resize', () => {
      this.setInputPosition()
    })
    this.observeDOM(document.documentElement, () => {
      this.setInputPosition()
    })

    this.input.addEventListener('input', (e: Event) => {
      this.showDropdown()
      if ((<HTMLInputElement>e.target).value.length === 0) this.hideDropdown()
    })
  }

  private setInputPosition(): void {
    const { height, width, left, top } = this.input.getBoundingClientRect()
    this.inputHeight = height
    this.inputWidth = width
    this.inputLeft = left
    this.inputTop = top

    if (this.dropdown) this.setDropdownPosition()
  }

  private initDropdown(): void {
    this.dropdown = document.createElement('div')
    this.dropdown.classList.add(
      `${CSS_CLASS_PREFIX}-${DROPDOWN_CONTAINER_CLASS}`
    )
    this.dropdown.classList.add(this.dropdownSpecificClass)
    if (this.dropdownClass) this.dropdown.classList.add(this.dropdownClass)
    this.setDropdownPosition()
  }

  private setDropdownPosition(): void {
    this.dropdown.style.width = !this.dropdownWidth
      ? `${this.inputWidth}px`
      : this.dropdownWidth
    this.dropdown.style.left = `${this.inputLeft}px` // TODO: add center option
    this.dropdown.style.top = `${this.inputTop + this.inputHeight}px` // TODO: add distance
  }

  private setDropdownItems(): void {
    this.dropdown.innerHTML = ''

    this.data?.forEach((obj: any) => {
      const item = document.createElement('div')
      item.classList.add(`${CSS_CLASS_PREFIX}-${DROPDOWN_ITEM_CLASS}`)

      if (this.dataAliases.icon) {
        const itemIcon = document.createElement('div')
        itemIcon.classList.add(
          `${CSS_CLASS_PREFIX}-${DROPDOWN_ITEM_ICON_CLASS}`
        )
        itemIcon.style.backgroundImage = `url(${obj[this.dataAliases.icon]})`
        item.appendChild(itemIcon)
      }

      if (this.dataAliases.title) {
        const itemTitle = document.createElement('div')
        itemTitle.classList.add(
          `${CSS_CLASS_PREFIX}-${DROPDOWN_ITEM_TITLE_CLASS}`
        )
        itemTitle.innerHTML = obj[this.dataAliases.title]
        item.appendChild(itemTitle)
      }

      if (this.dataAliases.subtitle) {
        const itemSubtitle = document.createElement('div')
        itemSubtitle.classList.add(
          `${CSS_CLASS_PREFIX}-${DROPDOWN_ITEM_SUBTITLE_CLASS}`
        )
        itemSubtitle.innerHTML = obj[this.dataAliases.subtitle]
        item.appendChild(itemSubtitle)
      }

      this.dropdown.appendChild(item)
    })

    if (!this.isDropdownInserted) this.insertDropdown()
  }

  private insertDropdown(): void {
    document.body.appendChild(this.dropdown)
    this.isDropdownInserted = true
    if (this.useKeywalk) this.initKeywalk()
  }

  public showDropdown(): void {
    this.dropdown.style.display = 'block'
  }

  public hideDropdown(): void {
    this.dropdown.style.display = 'none'
    if (this.keywalkInstance) this.keywalkInstance.reset()
  }

  private detectOnFocusInput(el: HTMLElement): void {
    if (
      this.input.value.length > 0 &&
      (el.matches(this.selector) ||
        el.matches(`${this.selector} *`) ||
        el.matches(`.${this.dropdownSpecificClass}`) ||
        el.matches(`.${this.dropdownSpecificClass} *`))
    ) {
      this.showDropdown()
    }
  }

  private detectOnBlurInputOrDropdown(el: HTMLElement): void {
    if (
      !el.matches(this.selector) &&
      !el.matches(`${this.selector} *`) &&
      !el.matches(`.${this.dropdownSpecificClass}`) &&
      !el.matches(`.${this.dropdownSpecificClass} *`)
    ) {
      this.hideDropdown()
    }
  }

  private initKeywalk(): void {
    this.keywalkInstance = new Keywalk({
      trigger: this.input,
      container: this.dropdown,
      onWalk: (element: HTMLElement, index: number) => {
        this.emitOnWalk(element, index)
      },
      onSelect: (element: HTMLElement, index: number) => {
        this.emitOnSelect(element, index)
      }
    })
  }

  private emitOnWalk(element: HTMLElement, index: number): void {
    if (this.args.onWalk) this.args.onWalk(element, index, this.data[index])
  }

  private emitOnSelect(element: HTMLElement, index: number): void {
    if (this.args.onSelect) this.args.onSelect(element, index, this.data[index])
  }

  public updateData(updatedData: any[]): void {
    this.data = updatedData
    this.setDropdownItems()
  }

  private observeDOM(obj: any, callback: any): void {
    const MutationObserver =
      window.MutationObserver || window.WebKitMutationObserver

    if (!obj || obj.nodeType !== 1) return

    if (MutationObserver) {
      // define a new observer
      const mutationObserver = new MutationObserver(callback)

      // have the observer observe foo for changes in children
      mutationObserver.observe(obj, {
        attributes: true,
        childList: true,
        subtree: true
      })
      return mutationObserver
    }

    // browser support fallback
    else if (window.addEventListener) {
      obj.addEventListener('DOMNodeInserted', callback, false)
      obj.addEventListener('DOMNodeRemoved', callback, false)
    }
  }
}
