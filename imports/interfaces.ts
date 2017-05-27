export interface Project {
    owner: string;
    shared: string;
    type: string;
    title: string;
    color: number;
    readonly id: string;
    _id?: string; 
}

export interface Backlog {
    title: string;
	project: string;
	readonly id: string;
    _id?: string; 
}

export interface Column {
    title: string;
	readonly id: string;
    _id?: string; 
}

export interface Lane {
    title: string;
    columns: Column[];
	project: string;
	readonly id: string;
    _id?: string; 
}

export interface Card {
    title: string;
	project: string;
	location: string;
	column: string;
	position: number;
	readonly id: string;
    _id?: string; 
}

export interface Email {
    project: string;
    color: number;
    _id?: string; 
}

export interface EmailElement {
    project: string;
    position: number;
    type: number;
    color: number;
    font: string;
    amount: number;
    height: number;
    width: number;
    spacerTop: number;
    spacerBottom: number;
    urls: string[];
    texts: string[];
    _id?: string; 
}

export interface APICall {
    project: string;
    status: number;
    url: string;
    response: any;
    readonly id: string;
    _id?: string; 
}