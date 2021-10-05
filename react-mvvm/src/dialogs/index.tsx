export interface IConfirmationDialog {
  type: 'Confirmation';
  content: string;
  yes: () => void;
  no: () => void;
}

export interface IAlertDialog {
  type: 'Alert';
  title: string;
  content: string;
  isSuccess: boolean;
  ok: () => void;
}

export function confirmationDialog(content: string) {
  return function (close: (result: boolean) => void): IConfirmationDialog {
    return {
      type: 'Confirmation',
      content: content,
      yes: () => close(true),
      no: () => close(false)
    };
  };
}

export function alertDialog(title: string, content: string, isSuccess: boolean = true) {
  return function (close: (result: undefined) => void): IAlertDialog {
    return {
      type: 'Alert',
      title: title,
      content: content,
      isSuccess,
      ok: () => close(undefined)
    };
  };
}
