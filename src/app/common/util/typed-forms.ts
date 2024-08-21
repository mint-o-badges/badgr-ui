import {
	AbstractControl,
	AbstractControlOptions,
	AsyncValidatorFn,
	FormArray,
	FormControl,
	FormGroup,
	ValidatorFn,
	Validators,
} from '@angular/forms';
import { markControlsDirty } from './form-util';

/**
 * A function that exercises the typed forms to ensure they compile correctly.
 */
function typedFormExample() {
	// Create a typed form whose type is dynamically constructed by the builder calls
	const group = new TypedFormGroup()
		.add('firstName', typedControl('', Validators.required))
		.add('lastName', typedControl('', Validators.required))
		.add(
			'address',
			typedFormGroup()
				.add('street', typedControl('2557 Kincaid'))
				.add('city', typedControl('Eugene'))
				.add('zip', typedControl('97405')),
		)
		.addArray('items', typedFormGroup().addControl('itemName', '').addControl('itemId', 0));
	// All these are type checked:
	group.value.address.street.trim();
	const a = group.controls.firstName.value;
	const b = group.rawControlMap.firstName.value;
	const c = group.value.items[0].itemId;
}

/**
 * Creates a typed [[FormControl]] wrapper with the given starting value, validator (or conjunctive validator array),
 * and configurator function (to do additional configuration of the control).
 *
 * @param {ValueType} value
 * @param {ValidatorFn | ValidatorFn[]} validator
 * @param {(control: TypedFormControl<ValueType>) => void} configurator
 * @returns {TypedFormControl<ValueType>}
 */
export function typedControl<ValueType>(
	value: ValueType,
	validator?: ValidatorFn | ValidatorFn[],
	configurator?: (control: TypedFormControl<ValueType>) => void,
): TypedFormControl<ValueType> {
	const control = new TypedFormControl(value, validator);
	if (configurator) configurator(control);
	return control;
}

/**
 * Creates an empty typed form group. Used for starting out a typed form
 *
 * @returns {TypedFormGroup<{}, {}>}
 */
export function typedFormGroup(
	validatorOrOpts?: ValidatorFn | ValidatorFn[] | AbstractControlOptions | null,
	asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[] | null,
): TypedFormGroup<{}, {}> {
	return new TypedFormGroup(validatorOrOpts, asyncValidator);
}

/**
 * Creates a typed form array for the given template item.
 *
 * @param {ItemType & TypedFormItem<ItemValueType>} templateItem
 * @returns {TypedFormArray<ItemValueType, ItemType extends TypedFormItem<ItemValueType>>}
 */
export function typedFormArray<ItemValueType, ItemType extends TypedFormItem<ItemValueType>>(
	templateItem: ItemType & TypedFormItem<ItemValueType>,
	validator?: ValidatorFn | ValidatorFn[]
): TypedFormArray<ItemValueType, ItemType> {
	return new TypedFormArray<ItemValueType, ItemType>(templateItem, validator);
}

/**
 * Base class for typed form items. Knows what it's own value type is.
 */
export abstract class TypedFormItem<ValueType> {
	abstract readonly rawControl: AbstractControl;

	get value(): ValueType {
		return this.rawControl.value;
	}
	get status() {
		return this.rawControl.status;
	}
	get valid() {
		return this.rawControl.valid;
	}
	get invalid() {
		return this.rawControl.invalid;
	}
	get pending() {
		return this.rawControl.pending;
	}
	get disabled() {
		return this.rawControl.disabled;
	}
	get enabled() {
		return this.rawControl.enabled;
	}
	get errors() {
		return this.rawControl.errors;
	}
	get pristine() {
		return this.rawControl.pristine;
	}
	get dirty() {
		return this.rawControl.dirty;
	}
	get touched() {
		return this.rawControl.touched;
	}
	get untouched() {
		return this.rawControl.untouched;
	}

	/**
	 * Marks all controls in this tree dirty and returns true if the form is valid.
	 */
	markTreeDirtyAndValidate() {
		markControlsDirty(this.rawControl);
		return this.valid;
	}

	/**
	 * Marks all controls in this tree dirty.
	 */
	markTreeDirty() {
		markControlsDirty(this.rawControl);
	}

	/**
	 * Sets the value of this form item.
	 */
	abstract setValue(
		value: ValueType,
		options?: {
			onlySelf?: boolean;
			emitEvent?: boolean;
			emitModelToViewChange?: boolean;
			emitViewToModelChange?: boolean;
		},
	);

	/**
	 * Recursively creates a copy of this TypedFormItem tree with all values intact.
	 */
	abstract clone(): this;

	/**
	 * Resets the value of this TypedFormItem tree to the original default values passed in at creation.
	 */
	abstract reset();
}

/**
 * Typed control, wraps a [[FormControl]] and holds the type of the control.
 */
export class TypedFormControl<ValueType> extends TypedFormItem<ValueType> {
	readonly rawControl: FormControl;

	constructor(
		private initialValue: ValueType,
		validator?: ValidatorFn | ValidatorFn[],
	) {
		super();

		this.rawControl = new FormControl(
			initialValue,
			Array.isArray(validator) ? Validators.compose(validator) : validator,
		);
	}

	clone(): this {
		return new TypedFormControl(this.value, this.rawControl.validator) as this;
	}

	reset() {
		this.rawControl.reset(this.initialValue);
	}

	setValue(
		value: ValueType,
		options?: {
			onlySelf?: boolean;
			emitEvent?: boolean;
			emitModelToViewChange?: boolean;
			emitViewToModelChange?: boolean;
		},
	) {
		this.rawControl.setValue(value);
	}
}

type RawGroupOf<T> = {
	[F in keyof T]: AbstractControl;
};

/**
 * Typed group of control. Wraps a [[FormGroup]] and keeps track of the type of the value object and controls object.
 *
 * Use the `add*` methods to add items to this group and the type of the controls and the resulting value will be
 * maintained.
 */
export class TypedFormGroup<ValueType = {}, ControlsType = {}> extends TypedFormItem<ValueType> {
	readonly rawControl: FormGroup;
	controls = {} as ControlsType;

	constructor(
		validatorOrOpts?: ValidatorFn | ValidatorFn[] | AbstractControlOptions | null,
		asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[] | null,
	) {
		super();
		this.rawControl = new FormGroup({}, validatorOrOpts, asyncValidator);
	}

	/**
	 * Provides a read-only array of the child controls of this group.
	 */
	get controlsArray() {
		return Object.values(this.controls);
	}

	get rawControlMap(): RawGroupOf<ControlsType> {
		return this.rawControl.controls as RawGroupOf<ControlsType>;
	}

	addControl<NameType extends string, ItemValueType>(
		name: NameType,
		value: ItemValueType,
		validator?: ValidatorFn | ValidatorFn[],
		configurator?: (control: TypedFormControl<ItemValueType>) => void,
	): TypedFormGroup<
		ValueType & Record<NameType, ItemValueType>,
		ControlsType & Record<NameType, TypedFormControl<ItemValueType>>
	> {
		return this.add(name, typedControl<ItemValueType>(value, validator, configurator));
	}

	addArray<NameType extends string, ItemType extends TypedFormItem<ItemValueType>, ItemValueType>(
		name: NameType,
		templateItem: ItemType & TypedFormItem<ItemValueType>,
        validator?: ValidatorFn | ValidatorFn[]
	): TypedFormGroup<
		ValueType & Record<NameType, ItemValueType[]>,
		ControlsType & Record<NameType, TypedFormArray<ItemValueType, ItemType>>
	> {
		return this.add(name, typedFormArray(templateItem, validator));
	}

	add<NameType extends string, ItemType extends TypedFormItem<ItemValueType>, ItemValueType>(
		name: NameType,
		typedItem: ItemType & TypedFormItem<ItemValueType>,
	): TypedFormGroup<ValueType & Record<NameType, ItemValueType>, ControlsType & Record<NameType, ItemType>> {
		(this.controls as unknown as { [name: string]: TypedFormItem<unknown> })[name] = typedItem;
		this.rawControl.addControl(name, typedItem.rawControl);
		return this as unknown as TypedFormGroup<
			ValueType & Record<NameType, ItemValueType>,
			ControlsType & Record<NameType, ItemType>
		>;
	}

	clone(): this {
		const group = new TypedFormGroup();
		Object.entries(this.controls).forEach(([name, value]) => group.add(name, value.clone()));
		return group as this;
	}

	reset() {
		Object.entries(this.controls).forEach(([name, value]) => value.reset());
	}

	setValue(
		value: ValueType,
		options?: {
			onlySelf?: boolean;
			emitEvent?: boolean;
			emitModelToViewChange?: boolean;
			emitViewToModelChange?: boolean;
		},
	) {
		Object.keys(this.controls).forEach((key) => {
			this.controls[key].setValue(value[key]);
		});
	}

	hasError(errorCode: string, path?: Array<string | number> | string) {
		return this.rawControl.hasError(errorCode, path);
	}
}

/**
 * Typed template-based form array. Wraps a [[FormArray]] and holds a template of the type of item that will be added
 * to the array. Can only be used to hold the same type of form item, but automates creating new instances of it.
 */
export class TypedFormArray<ItemValueType, ItemType extends TypedFormItem<ItemValueType>> extends TypedFormItem<
	ItemValueType[]
> {
	readonly rawControl;

	controls: ItemType[] = [];

	constructor(public templateItem: ItemType & TypedFormItem<ItemValueType>, validator?: ValidatorFn | ValidatorFn[]) {
		super();
        this.rawControl = new FormArray([], validator);
	}

	get rawControls(): AbstractControl[] {
		return this.rawControl.controls;
	}

	get length() {
		return this.rawControls.length;
	}

	push(item: ItemType): this {
		this.controls.push(item);
		this.rawControl.push(item.rawControl);
		return this;
	}

	addFromTemplate() {
		this.push(this.templateItem.clone());
	}

	clone(): this {
		const array = new TypedFormArray(this.templateItem);
		this.controls.forEach((item) => array.push(item.clone()));
		return array as this;
	}

	reset() {
		this.controls.forEach((item) => item.reset());
	}

	removeAt(i: number): ItemType {
		const control = this.controls[i];
		this.controls.splice(i, 1);
		this.rawControl.removeAt(i);
		return control;
	}

	setValue(
		value: ItemValueType[],
		options?: {
			onlySelf?: boolean;
			emitEvent?: boolean;
			emitModelToViewChange?: boolean;
			emitViewToModelChange?: boolean;
		},
	) {
		while (this.controls.length < value.length) {
			this.addFromTemplate();
		}

		while (this.controls.length > value.length) {
			this.removeAt(this.controls.length - 1);
		}

		this.controls.forEach((control, i) => control.setValue(value[i]));
	}
}
