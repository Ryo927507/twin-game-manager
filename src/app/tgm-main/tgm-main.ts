import { Component } from '@angular/core';
import { TgmHeader } from "../tgm-header/tgm-header";
import { TgmFooter } from "../tgm-footer/tgm-footer";

@Component({
  selector: 'app-tgm-main',
  imports: [TgmHeader, TgmFooter],
  templateUrl: './tgm-main.html',
  styleUrl: './tgm-main.scss',
})
export class TgmMain {}
