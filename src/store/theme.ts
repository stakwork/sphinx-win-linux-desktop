
import { observable, action } from 'mobx'
import { persist } from 'mobx-persist'

type Mode = 'System' | 'Dark' | 'Light'

export class ThemeStore {

  @persist @observable
  mode: Mode = 'System'

  @action setMode(m: Mode) {
    this.mode = m
  }

  @observable dark: boolean = false
  @action setDark(d: boolean) {
    this.dark = d
    this.main = d ? '#1c252e' : '#FFF'
    this.bg = d ? '#141d26' : '#f3f3f3'
    this.title = d ? '#ddd' : '#666'
    this.subtitle = d ? '#8b98b4' : '#7e7e7e'
    this.border = d ? '#111' : '#ccc'
    this.selected = d ? '#3b4681' : '#ddddff'
    this.deep = d ? '#292c33' : '#ccc'
  }

  @observable bg: string = '#FFF'
  @observable main: string = '#f3f3f3'
  @observable title: string = '#666'
  @observable subtitle: string = '#7e7e7e'
  @observable border: string = '#ccc'
  @observable selected: string = '#ddddff'
  @observable deep: string = '#ccc'

  primary: string = '#6289FD'
  accent: string = '#48c998'
  active: string = '#49ca97'
  inactive: string = '#febd59'
  error: string = '#DB5554'

}

export const themeStore = new ThemeStore()