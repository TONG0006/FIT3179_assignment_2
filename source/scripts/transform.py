#!/usr/bin/env python3

import csv
import os
import pandas as pd

import matplotlib.pyplot as plt


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


def GM_normalised_histogram():

    gm_normal_dataset = GM_count_normalised()
    gm_normal_count = [gm_country["count_normal"] for gm_country in gm_normal_dataset._data]
    gm_normal_count.sort()

    non_zero_gm_normal = []
    for gm_normal in gm_normal_count:
        if gm_normal != 0:
            non_zero_gm_normal.append(gm_normal)

    plt.hist(non_zero_gm_normal, bins=500)
    plt.ylabel("The number of chess GrandMasters per 10,000 people")
    plt.xlabel("Country occurence")
    plt.show()

    return non_zero_gm_normal


def chess_scatter():
    chess_players = Dataset("source/datasets/reference/players.csv")
    continents = Dataset("source/datasets/reference/continents2.csv")
    chess_ratings = Dataset("source/datasets/reference/ratings_2021.csv")

    continents.rename("name", "country name")
    titled_country = join(chess_players, continents, "federation", "alpha-3").filter(["title", "country name"])

    final = dict()
    for data in titled_country._data:
        if data["title"]:
            if data["country name"] in final:
                final[data["country name"]]["total players"] += 1
                final[data["country name"]]["titled players"] += 1
            else:
                final[data["country name"]] = {"total players": 1, "titled players": 1}
        else:
            if data["country name"] in final:
                final[data["country name"]]["total players"] += 1
            else:
                final[data["country name"]] = {"total players": 1, "titled players": 0}

    dataset = []
    for country in final:
        a = {"country name": country}
        a.update(final[country])
        dataset.append(a)

    final_dataset = join(Dataset(data=dataset), continents, "country name", "country name").filter(
        ["country name", "total players", "titled players", "region"]
    )
    final_dataset.rename("country name", "country_name")
    final_dataset.rename("total players", "total_players")
    final_dataset.rename("titled players", "titled_players")
    final_dataset.rename("region", "continent")
    final_dataset.export("source/datasets/transformed/Titled players.csv")


def chess_scatter_2():
    chess_players = pd.read_csv("source/datasets/reference/players_test.csv")
    chess_ratings = pd.read_csv("source/datasets/reference/ratings_2021.csv")
    continents = pd.read_csv("source/datasets/reference/continents2.csv")

    print(
        chess_ratings[
            (chess_ratings["month"] == 1)
            & (chess_ratings["rating_standard"] != "")
            & (chess_ratings["rating_standard"].notnull())
        ]
    )

    final = pd.merge(chess_players, continents, left_on="federation", right_on="alpha-3")
    final = pd.merge(
        final,
        chess_ratings[(chess_ratings["month"] == 1) & (chess_ratings["rating_standard"].notnull())],
        left_on="fide_id",
        right_on="fide_id",
    )
    final.to_csv("source/datasets/reference/titled_players.csv")

    final = final[["gender", "title", "name_y", "region", "sub-region", "intermediate-region", "rating_standard"]]

    final.to_csv("source/datasets/reference/out.csv")
    # chess_players.to_csv("source/datasets/reference/out.csv")


if __name__ == "__main__":
    # print(GM_count())
    # print(GM_count_normalised())
    # print(GM_normalised_histogram())
    # chess_scatter()
    chess_scatter_2()
