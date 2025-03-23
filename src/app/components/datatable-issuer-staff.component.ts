import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { HlmIconModule } from './spartan/ui-icon-helm/src';
import { RouterModule } from '@angular/router';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { HlmTableModule } from './spartan/ui-table-helm/src';
import { IssuerStaffMember } from '../issuer/models/issuer.model';
import { OebButtonComponent } from './oeb-button.component';
import { HlmPDirective } from '../components/spartan/ui-typography-helm/src/lib/hlm-p.directive';
import { FormControl } from '@angular/forms';
import { OebSelectComponent } from './select.component';

@Component({
    selector: 'issuer-staff-datatable',
    standalone: true,
    imports: [
        HlmTableModule,
        HlmIconModule,
        CommonModule,
        OebButtonComponent,
        OebSelectComponent,
        TranslateModule,
        RouterModule,
        HlmPDirective
        ],
    template: `
        <hlm-table class="tw-rounded-t-[20px] tw-overflow-hidden tw-w-full tw-max-w-[100%] tw-bg-white tw-border-lightgrey tw-border">
            <hlm-caption>{{caption}}</hlm-caption>
            <hlm-trow class="!tw-bg-lightgrey tw-text-oebblack tw-flex-wrap hover:tw-bg-lightgrey">
                <!-- Name -->
                <hlm-th class="tw-text-oebblack tw-w-28 sm:tw-w-20 md:tw-w-40">Name</hlm-th>
                <!-- E-Mail -->
                <hlm-th class="tw-text-oebblack tw-justify-center !tw-flex-1 tw-w-24 sm:tw-w-28  md:tw-w-48 !tw-px-3 sm:!tw-px-4">E-Mail</hlm-th>
                <!-- Role -->
                <hlm-th class="tw-text-oebblack tw-w-36 md:tw-w-40 sm:tw-grid sm:tw-pl-0">Rolle</hlm-th>
                <!-- Actions -->
                <hlm-th class="tw-text-oebblack tw-justify-end sm:tw-w-48 tw-w-0 !tw-p-0"></hlm-th>
            </hlm-trow>
            <hlm-trow *ngFor="let member of members" class="tw-border-purple tw-flex-wrap tw-py-2">
                <hlm-th class="tw-w-28 md:tw-w-48 tw-cursor-pointer tw-flex-col tw-items-baseline tw-gap-1 md:tw-gap-2 md:tw-items-center md:tw-flex-row">
                    <div class="md:tw-grid md:tw-grid-cols-[150px] lg:tw-grid-cols-[250px] xl:tw-grid-cols-[350px] tw-my-1 md:tw-my-0">
                      <div class="tw-text-nowrap md:tw-text-wrap md:tw-line-clamp-3 tw-break-word  tw-max-w-36 md:tw-max-w-none tw-absolute md:tw-relative">
                        <span class="tw-text-oebblack tw-cursor-pointer">{{member.nameLabel}}</span>
                      </div>
                    </div>
                </hlm-th>
                <hlm-th class="!tw-flex-1 tw-justify-center !tw-text-oebblack tw-w-24 sm:tw-w-28 md:tw-w-48 sm:tw-px-3 tw-px-4"><p hlmP class="tw-font-normal sm:!tw-text-[16px]">{{member.email}}</p></hlm-th>
                <hlm-th class="tw-w-36 md:tw-w-40 tw-justify-center !tw-text-oebblack sm:tw-grid">
                    <oeb-select
							actionBar="true"
							[placeholder]="member.roleInfo.label"
							class="oeb tw-w-[12rem]"
							[options]="roleOptions"
							[control]="roleControl"
							[autofocus]="true"
							noTopMargin="true"
					></oeb-select>
                </hlm-th>
                <hlm-th
                    class="tw-justify-center sm:tw-justify-end !tw-text-oebblack tw-flex-col tw-h-fit sm:tw-w-max tw-w-full tw-gap-2 tw-my-2 tw-mt-7 sm:tw-mt-2"

                >
                    <span>Entfernen</span>
                </hlm-th>
            </hlm-trow>
        </hlm-table>`,
})
export class IssuerStaffDatatableComponent {
    @Input() caption: string = "";
    @Input() members: any[];
    @Input() roleOptions: any[];

    roleControl = new FormControl('');

    ngOnInit(){
        console.log(this.roleOptions)
    }
}
