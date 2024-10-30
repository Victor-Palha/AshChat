import { randomUUID } from "node:crypto";

export class ID {
    private readonly value: string;
    
    constructor(value: string | null | undefined) {
        this.value = value ?? randomUUID();
    }
    
    get getValue(): string {
        return this.value;
    }
}