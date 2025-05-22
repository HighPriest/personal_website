export type Map = {
    old_category: string;
    old_pacenote: string;
    old_id: number;
    new_category: string[];
    new_pacenote: string[];
    new_id: number[];
};

export type MapContainer = {
    name: string;
    map: Map[];
};

export type Config = {
    id: number;
    category: string;
    slot: string;
};

export type ConfigContainer = {
    name: string;
    config: Config[];
    maps: MapContainer[];
};