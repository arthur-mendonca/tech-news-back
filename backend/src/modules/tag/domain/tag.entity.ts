export class Tag {
    id: string;
    name: string;

    constructor(props: Partial<Tag>) {
        Object.assign(this, props);
    }
}
