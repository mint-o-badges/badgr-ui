import { Component, OnInit, Input, inject, Output, EventEmitter } from '@angular/core';
import {
	DndDraggableDirective,
	DndDropEvent,
	DndDropzoneDirective,
	DndHandleDirective,
	DndPlaceholderRefDirective,
	DropEffect,
	EffectAllowed,
	DndModule,
} from 'ngx-drag-drop';
import { TranslateService } from '@ngx-translate/core';
import { BadgeClassManager } from '../../../../issuer/services/badgeclass-manager.service';
import { HlmDialogService } from '../../../../components/spartan/ui-dialog-helm/src/lib/hlm-dialog.service';
import { DangerDialogComponent } from '../../../../common/dialogs/oeb-dialogs/danger-dialog.component';
import { typedFormGroup } from '../../../../common/util/typed-forms';
import { FormControl, Validators } from '@angular/forms';
import { BadgeClass } from '../../../../issuer/models/badgeclass.model';

@Component({
    selector: 'learningpath-badge-order',
    templateUrl: './learningpath-badge-order.component.html',
    styleUrls: ['../../learningpath-edit-form/learningpath-edit-form.component.scss']
  })
  export class LearningPathBadgeOrderComponent implements OnInit {
    constructor(
		protected badgeClassService: BadgeClassManager,
        protected translate: TranslateService

    ){
       
        
    }
    @Input() selectedBadgeUrls: string[] = [];
	@Input() selectedBadges: BadgeClass[]
	@Output() badgeListChanged = new EventEmitter<any>();

    ngOnInit(): void {
		this.draggableList = this.selectedBadges.map((badge, index) => {
			return {
				id: badge.slug,
				name: badge.name,
				image: badge.image,
				description: badge.description,
				slug: badge.slug,
				issuerName: badge.issuerName,
				order: index
			};
		})
		this.badgeListChanged.emit(this.draggableList)
		// this.selectedBadgesLoaded = this.loadSelectedBadges();
    }

	// arrayLengthValidator(control: FormControl) {
	// 	return this.draggableList.length >= 3 ? null : { minLength: true };
	// }

	// lpBadgesForm = typedFormGroup(this.arrayLengthValidator.bind(this))

    draggableList: { id: string; name: string; image: any; description: string; slug: string; issuerName: string, order: number }[] =
		[];

	private readonly _hlmDialogService = inject(HlmDialogService);
    public openDangerDialog(index: number) {
        const dialogRef = this._hlmDialogService.open(DangerDialogComponent, {
            context: {
				delete: () => {
					this.draggableList.splice(index, 1)
					this.badgeListChanged.emit(this.draggableList);
				},
                variant: 'danger',
                text: "Are you sure you want to remove this badge from the learningpath?",
            },
        });
    }    

    checkboxChange(event, index: number){
        if(!event){
            this.openDangerDialog(index)
        }
    }    

    // async loadSelectedBadges(){
	// 	 const selectedBadges =	await this.badgeClassService.publicBadgesByUrls(this.selectedBadgeUrls)
	// 	 this.draggableList = selectedBadges.reverse().map((badge) => {
	// 		return {
	// 			id: badge.slug,
	// 			name: badge.name,
	// 			image: badge.image,
	// 			description: badge.description,
	// 			slug: badge.slug,
	// 			issuerName: badge.issuerName,
	// 		};
	// 	})
	// 	this.badgeListChanged.emit(this.draggableList);
	// } 
	
	recalculateOrder(list: any[]) {
		list.forEach((item, index) => {
		  item.order = index;
		});
	}

    onDragged(item: any, list: any[], effect: DropEffect) {
		const index = list.indexOf(item);
		list.splice(index, 1);
		this.recalculateOrder(list);
		this.badgeListChanged.emit(this.draggableList);
	}

	onDrop(event: DndDropEvent, index: number, list: any[]) {
		const previousIndex = list.findIndex((item) => item.id === event.data.id);

		if (previousIndex !== -1) {
			list.splice(previousIndex, 1);
		}

		if (typeof index === 'undefined') {
			index = list.length;
		}

		list.splice(index, 0, event.data);
		this.recalculateOrder(list)
		this.badgeListChanged.emit(this.draggableList);
	}

  
}