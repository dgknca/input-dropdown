import Keywalk from 'keywalk'
import { onWalkFunction, onSelectFunction } from './types'
import './style.scss'

import {
  CSS_CLASS_PREFIX,
  DROPDOWN_CONTAINER_CLASS,
  DROPDOWN_ITEM_CLASS,
  DROPDOWN_ITEM_IMG_CLASS,
  DROPDOWN_ITEM_TXT_1_CLASS,
  DROPDOWN_ITEM_TXT_2_CLASS
} from './constants'

interface IDataAliases {
  img?: string
  text1?: string
  text2?: string
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
}

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
  dropdownWidth: string
  dropdownClass: string
  useKeywalk: boolean

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

    this.initInput()
    this.initDropdown()

    document.addEventListener('click', (ev: Event) => {
      this.detectOnFocusInput(ev.target as HTMLElement)
      this.detectOnBlurInputOrDropdown(ev.target as HTMLElement)
    })
  }

  private initInput(): void {
    this.input = document.querySelector(this.selector) as HTMLInputElement
    const { height, width, left, top } = this.input.getBoundingClientRect()
    this.inputHeight = height
    this.inputWidth = width
    this.inputLeft = left
    this.inputTop = top

    this.input.addEventListener('input', (e: Event) => {
      this.showDropdown()
      if ((<HTMLInputElement>e.target).value.length === 0) this.hideDropdown()
    })
  }

  private initDropdown(): void {
    this.dropdown = document.createElement('div')

    this.dropdown.classList.add(`${CSS_CLASS_PREFIX}-${DROPDOWN_CONTAINER_CLASS}`)
    if (this.dropdownClass) this.dropdown.classList.add(this.dropdownClass)

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

      if (this.dataAliases.img) {
        const itemImg = document.createElement('div')
        itemImg.classList.add(`${CSS_CLASS_PREFIX}-${DROPDOWN_ITEM_IMG_CLASS}`)
        itemImg.style.backgroundImage = `url(${obj[this.dataAliases.img]})`
        item.appendChild(itemImg)
      }

      if (this.dataAliases.text1) {
        const itemTxt1 = document.createElement('div')
        itemTxt1.classList.add(`${CSS_CLASS_PREFIX}-${DROPDOWN_ITEM_TXT_1_CLASS}`)
        itemTxt1.innerHTML = obj[this.dataAliases.text1]
        item.appendChild(itemTxt1)
      }

      if (this.dataAliases.text2) {
        const itemTxt2 = document.createElement('div')
        itemTxt2.classList.add(`${CSS_CLASS_PREFIX}-${DROPDOWN_ITEM_TXT_2_CLASS}`)
        itemTxt2.innerHTML = obj[this.dataAliases.text2]
        item.appendChild(itemTxt2)
      }

      this.dropdown.appendChild(item)
    })

    this.insertDropdown()
  }

  private insertDropdown(): void {
    document.body.appendChild(this.dropdown)
    if (this.useKeywalk) this.initKeywalk()
  }

  private showDropdown(): void {
    this.dropdown.style.display = 'block'
  }

  private hideDropdown(): void {
    this.dropdown.style.display = 'none'
  }

  private detectOnFocusInput(el: HTMLElement): void {
    if (
      this.input.value.length > 0 &&
      (el.matches(this.selector) ||
        el.matches(`${this.selector} *`) ||
        el.matches(`.${CSS_CLASS_PREFIX}-${DROPDOWN_CONTAINER_CLASS}`) ||
        el.matches(`.${CSS_CLASS_PREFIX}-${DROPDOWN_CONTAINER_CLASS} *`))
    ) {
      this.showDropdown()
    }
  }

  private detectOnBlurInputOrDropdown(el: HTMLElement): void {
    if (
      !el.matches(this.selector) &&
      !el.matches(`${this.selector} *`) &&
      !el.matches(`.${CSS_CLASS_PREFIX}-${DROPDOWN_CONTAINER_CLASS}`) &&
      !el.matches(`.${CSS_CLASS_PREFIX}-${DROPDOWN_CONTAINER_CLASS} *`)
    ) {
      this.hideDropdown()
    }
  }

  private initKeywalk(): void {
    new Keywalk({
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
    if (this.args.onWalk) this.args.onWalk(element, index)
  }

  private emitOnSelect(element: HTMLElement, index: number): void {
    if (this.args.onSelect) this.args.onSelect(element, index)
  }

  public updateData(updatedData: any[]): void {
    this.data = updatedData
    this.setDropdownItems()
  }
}
