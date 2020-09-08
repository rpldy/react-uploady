import createState from "./index";

interface State {
    foo: string,
    bob: string,
}

const testCreateState = (): void => {

    const { state, update, unwrap } = createState<State>({
        foo: "bar",
        bob: "mcintyre",
    });

    console.log(state.foo);

    update((state)=> {
       state.bob = "alice";
    });

    const org = unwrap();

    console.log(org);
};

export {
    testCreateState,
};