import { FormField, FormValidationState } from "../src/forms";
import { tick } from "./utils";

test('Newly crested Field is pristine and pending validation', async () => {
    
    const field = new FormField("pristine", { validate: async (v) => true });
    
    expect(field.state).toBe(FormValidationState.Pending);
    expect(field.isDirty).toBe(false);
    expect(field.isPristine).toBe(true);
});

test('Modifying value makes the field dirty', () => {
    
    const field = new FormField("pristine", { validate: async (v) => true });
    
    field.value = "modified value";
    expect(field.state).toBe(FormValidationState.Pending);
    expect(field.isDirty).toBe(true);
    expect(field.isPristine).toBe(false);
});

test('Commiting value triggers validation', async () => {

    const validate = jest.fn<Promise<true | string[]>, [string | undefined]>(async (v) => true);
    
    const field = new FormField("pristine", { validate: validate });

    await field.commit();
    
    expect(validate).toBeCalled();
    expect(field.state).toBe(FormValidationState.Valid);
});

test('When validation fails, field becomes invalid and has errors', async () => {

    const validate = jest.fn(async (v : string | undefined) : Promise<true | string[]> =>["ErrorMessage"]);

    const field = new FormField("pristine", { validate: validate });

    await field.validate();

    expect(validate).toBeCalled();
    expect(field.state).toBe(FormValidationState.Invalid);
    expect(field.errors).toContain("ErrorMessage")
});

test('When async validator is running, IsValidating is true', async () => {

    let finishValidation : ((result : true | string[]) => void) | undefined = undefined;
    
    const validate = (v : string | undefined) => new Promise<true | string[]>(r => {
        finishValidation = r;
    });

    const field = new FormField("pristine", { validate: validate });

    expect(field.state).toBe(FormValidationState.Pending);
    expect(field.isValidating).toBe(false);
    
    const validation = field.validate();

    await tick();

    expect(field.state).toBe(FormValidationState.Pending);
    expect(field.isValidating).toBe(true);

    finishValidation!(true);

    await tick();
    
    expect(field.state).toBe(FormValidationState.Valid);
    expect(field.isValidating).toBe(false);
    
    await validation;
});