import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TgmHeader } from "./tgm-header/tgm-header";
import { TgmMain } from "./tgm-main/tgm-main";
import { TgmFooter } from "./tgm-footer/tgm-footer";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TgmHeader, TgmMain, TgmFooter],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('twin-games-manager');
}
