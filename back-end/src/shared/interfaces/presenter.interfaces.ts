export interface Presenter<T, U> {
  present(data: T, options?: any): U | null;
}
