import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { BadgeClass } from '../issuer/models/badgeclass.model';

@Component({
  selector: 'oeb-sort-select',
  template: `
    <oeb-select
      actionBar="true"
      class="oeb lg:tw-w-[10rem]"
      [options]="sortOptions"
      [control]="control"
      [autofocus]="true"
      noTopMargin="true"
    ></oeb-select>
  ` 
})
export class OebSortSelectComponent implements OnInit {
  @Input() control: FormControl = new FormControl('name_asc'); 
  @Input() result: BadgeClass[] = []; 
  @Input() recipient: boolean = false;

  sortOptions: Array<{ value: string; label: string }> =  [
    { value: 'name_asc', label: 'A-Z' },
    { value: 'name_desc', label: 'Z-A' },
    { value: 'date_asc', label: this.translate.instant('General.dateAscending') },
    { value: 'date_desc', label: this.translate.instant('General.dateDescending') },
  ];;

  constructor(private translate: TranslateService) {}

  ngOnInit(): void {
    this.control.valueChanges.subscribe((value) => {
      this.changeOrder(value);
    });
  }


  changeOrder(sortOption: string): void {
    const [sortBy, order] = sortOption.split('_') as ['name' | 'date', 'asc' | 'desc'];
    const multiplier = order === 'asc' ? 1 : -1;

    const sortFn = (a: any, b: any): number => {
        const getFields = (item: any) => {
          if (this.recipient) {
            return {
              name: item.badge.apiModel.json.badge.name,
              createdOn: new Date(item.badge.apiModel.json.issuedOn).getTime(),
            };
          }
          return {
            name: item.name,
            createdOn: new Date(item.createdAt).getTime(),
          };
        };
      
        const { name: nameA, createdOn: createdOnA } = getFields(a);
        const { name: nameB, createdOn: createdOnB } = getFields(b);
      
        if (sortBy === 'name') {
          return multiplier * nameA.localeCompare(nameB);
        }
        if (sortBy === 'date') {
          return multiplier * (createdOnA - createdOnB);
        }
      
        return 0;
      };
      
    this.result.sort(sortFn);
  }
}
