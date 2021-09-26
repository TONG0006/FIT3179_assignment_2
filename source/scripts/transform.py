#!/usr/bin/env python3

import csv
import os


def set_current_dir(filepath: str = os.path.dirname(os.path.realpath(__file__))) -> None:
    os.chdir(filepath)


class Dataset:
    def _open_dataset(self, filepath: str):
        with open(filepath, encoding="utf-8-sig") as file:
            return list(csv.DictReader(file))

    def __init__(self, filepath: str = None, data: list = None) -> None:
        self._data = self._open_dataset(filepath) if data is None else data

    def filter(self, filters: list):
        filtered_data = []
        for data in self._data:
            new_data = dict()
            for filter in filters:
                new_data[filter] = data[filter]
            filtered_data.append(new_data)
        return Dataset(data=filtered_data)

    def header(self) -> list:
        return [key for key in self._data[0]]

    def __str__(self) -> str:
        return str(self._data)

    def export(self, filepath: str) -> None:
        with open(filepath, "w", encoding="utf-8-sig") as file:
            writer = csv.writer(file)
            writer.writerow(self.header())
            for dict in self._data:
                writer.writerow([dict[key] for key in dict])

    def count(self, filter: str, filter_key: str, filter_value: str, dataset_type: bool = True):
        dataset_dict = dict()
        for data in self._data:
            if data[filter] not in dataset_dict:
                dataset_dict[data[filter]] = 1
            else:
                dataset_dict[data[filter]] += 1
        if dataset_type:
            return Dataset(data=[{filter_key: filter, filter_value: dataset_dict[filter]} for filter in dataset_dict])
        else:
            return dataset_dict

    def rename(self, filter: str, new_filter: str):
        for data in self._data:
            data[new_filter] = data[filter]
            del data[filter]

    def transform(self, filter: str, new_filter, transformation) -> None:
        for data in self._data:
            data[new_filter] = transformation(data, filter)

    def __len__(self):
        return len(self._data)


def join(dataset_1: Dataset, dataset_2: Dataset, attr_1: str, attr_2: str) -> list:
    new_dataset_data = []
    for data_1 in dataset_1._data:
        for data_2 in dataset_2._data:
            if data_1[attr_1] == data_2[attr_2]:
                new_dataset_data.append(data_1 | data_2)
    return Dataset(data=new_dataset_data)


def GM_count():
    lat_long = Dataset("source/datasets/reference/world_country_and_usa_states_latitude_and_longitude_values.csv")
    chess_grandmasters = Dataset("source/datasets/reference/WorldChessGrandMaster.csv")
    joined = join(chess_grandmasters.count("Federation", "country", "count"), lat_long, "country", "country").filter(
        ["country", "count", "latitude", "longitude"]
    )
    joined.export("source/datasets/transformed/GM count.csv")
    return joined


def GM_count_normalised():
    chess_players = Dataset("source/datasets/reference/players.csv")
    continents = Dataset("source/datasets/reference/continents2.csv")
    continents.rename("name", "country name")
    joined = join(chess_players, continents, "federation", "alpha-3").count(
        "country name", "country name", "total players", False
    )

    print(joined)

    def _transformation(data, filter):
        try:
            return round(data[filter] / joined[data["country"]] * 10000)
        except:
            return 0

    gm_count = GM_count()
    gm_count.transform("count", "count_normal", _transformation)
    final = gm_count.filter(["country", "count_normal"])
    final.export("source/datasets/transformed/GM count normalised.csv")

    return final


if __name__ == "__main__":
    print(GM_count())
    print(GM_count_normalised())
