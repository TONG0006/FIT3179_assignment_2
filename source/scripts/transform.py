#!/usr/bin/env python3

import csv
import os
import pandas as pd
import json

import matplotlib.pyplot as plt
from functools import reduce
from converter.pgn_data import PGNData


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
    joined = join(
        chess_grandmasters.count("Federation", "country", "move_count"), lat_long, "country", "country"
    ).filter(["country", "move_count", "latitude", "longitude"])
    joined.export("source/datasets/transformed/GM count.csv")
    return joined


def GM_count_normalised():
    chess_players = Dataset("source/datasets/reference/players.csv")
    continents = Dataset("source/datasets/reference/continents2.csv")
    continents.rename("move", "country name")
    joined = join(chess_players, continents, "federation", "alpha-3").count(
        "country name", "country name", "total players", False
    )

    def _transformation(data, filter):
        try:
            return round(data[filter] / joined[data["country"]] * 10000)
        except:
            return 0

    gm_count = GM_count()
    gm_count.transform("move_count", "count_normal", _transformation)
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

    continents.rename("move", "country name")
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
    chess_players = pd.read_csv("source/datasets/reference/players.csv")
    chess_ratings = pd.read_csv("source/datasets/reference/ratings_2021.csv")
    continents = pd.read_csv("source/datasets/reference/continents2.csv")

    final = pd.merge(chess_players, continents, left_on="federation", right_on="alpha-3")
    final = pd.merge(
        final,
        chess_ratings[(chess_ratings["month"] == 1) & (chess_ratings["rating_standard"].notnull())],
        left_on="fide_id",
        right_on="fide_id",
    )
    final.to_csv("source/datasets/reference/titled_players.csv")

    print(final)

    final = final[["gender", "title", "name_y", "region", "sub-region", "intermediate-region", "rating_standard"]]

    average_rating = (final.groupby("name_y").agg({"rating_standard": lambda x: sum(x) / len(x)})).rename(
        columns={"rating_standard": "average_rating"}
    )

    highest_rating = (final.groupby("name_y").agg({"rating_standard": lambda x: max(x)})).rename(
        columns={"rating_standard": "highest_rating"}
    )

    total_players = (
        final.groupby("name_y")
        .agg({"rating_standard": lambda x: len(x)})
        .rename(columns={"rating_standard": "total_player"})
    )

    total_titles = (
        final.groupby("name_y").agg({"title": lambda x: sum(x.notnull())}).rename(columns={"title": "total_titles"})
    )

    stats = [average_rating, highest_rating, total_players, total_titles]
    country_stats = reduce(lambda left, right: pd.merge(left, right, on="name_y"), stats).fillna("void")
    country_stats = pd.merge(country_stats, continents[["move", "region"]], left_on="name_y", right_on="move")

    print(country_stats)

    final.to_csv("source/datasets/transformed/titled_players.csv")

    # chess_players.to_csv("source/datasets/reference/out.csv")


def valid_type(x):
    return x == x


def valid_sum(x: list):
    return sum([y if valid_type(y) else 0 for y in x])


def valid_len(x: list):
    return sum([1 if valid_type(y) else 0 for y in x])


def valid_avg(x: list):
    a, b = valid_len(x), valid_sum(x)

    return b / a if a != 0 else 0


def valid_max(x: list):
    return max([y if valid_type(y) else 0 for y in x])


def chess_scatter_3():
    chess_players = pd.read_csv("source/datasets/reference/players.csv")
    chess_ratings = pd.read_csv("source/datasets/reference/ratings_2021.csv")
    continents = pd.read_csv("source/datasets/reference/continents2.csv")

    full_data = pd.merge(
        pd.merge(chess_players, continents, left_on="federation", right_on="alpha-3"),
        chess_ratings[(chess_ratings["month"] == 1)],
        left_on="fide_id",
        right_on="fide_id",
    )

    average_rating_standard = (full_data.groupby("name_y").agg({"rating_standard": lambda x: valid_avg(x)})).rename(
        columns={"rating_standard": "average_rating_standard"}
    )

    average_rating_rapid = (full_data.groupby("name_y").agg({"rating_rapid": lambda x: valid_avg(x)})).rename(
        columns={"rating_rapid": "average_rating_rapid"}
    )

    average_rating_blitz = (full_data.groupby("name_y").agg({"rating_blitz": lambda x: valid_avg(x)})).rename(
        columns={"rating_blitz": "average_rating_blitz"}
    )

    highest_rating_standard = (full_data.groupby("name_y").agg({"rating_standard": lambda x: valid_max(x)})).rename(
        columns={"rating_standard": "highest_rating_standard"}
    )

    highest_rating_rapid = (full_data.groupby("name_y").agg({"rating_rapid": lambda x: valid_max(x)})).rename(
        columns={"rating_rapid": "highest_rating_rapid"}
    )

    highest_rating_blitz = (full_data.groupby("name_y").agg({"rating_blitz": lambda x: valid_max(x)})).rename(
        columns={"rating_blitz": "highest_rating_blitz"}
    )

    total_players = (
        full_data.groupby("name_y")
        .agg({"rating_standard": lambda x: len(x)})
        .rename(columns={"rating_standard": "total_players"})
    )

    total_players_standard = (
        full_data.groupby("name_y")
        .agg({"rating_standard": lambda x: valid_len(x)})
        .rename(columns={"rating_standard": "total_players_standard"})
    )

    total_players_rapid = (
        full_data.groupby("name_y")
        .agg({"rating_rapid": lambda x: valid_len(x)})
        .rename(columns={"rating_rapid": "total_players_rapid"})
    )

    total_players_blitz = (
        full_data.groupby("name_y")
        .agg({"rating_blitz": lambda x: valid_len(x)})
        .rename(columns={"rating_blitz": "total_players_blitz"})
    )

    total_titles = (
        full_data.groupby("name_y").agg({"title": lambda x: valid_len(x)}).rename(columns={"title": "total_titles"})
    )

    stats = [
        average_rating_standard,
        average_rating_rapid,
        average_rating_blitz,
        highest_rating_standard,
        highest_rating_rapid,
        highest_rating_blitz,
        total_players,
        total_players_standard,
        total_players_rapid,
        total_players_blitz,
        total_titles,
    ]
    country_stats = reduce(lambda left, right: pd.merge(left, right, on="name_y"), stats).fillna("NaN")
    country_stats = pd.merge(country_stats, continents[["move", "region"]], left_on="name_y", right_on="move")
    country_stats = country_stats[
        [
            "move",
            "region",
            "average_rating_standard",
            "average_rating_rapid",
            "average_rating_blitz",
            "highest_rating_standard",
            "highest_rating_rapid",
            "highest_rating_blitz",
            "total_players",
            "total_players_standard",
            "total_players_rapid",
            "total_players_blitz",
            "total_titles",
        ]
    ]

    country_stats.to_csv("source/datasets/transformed/country_stats.csv")


def pgn_to_csv():
    pgn_data = PGNData(
        "/home/sizzleru/Documents/Repositories/FIT3179/FIT3179_assignment_2/source/datasets/reference/Chess database/games_1610_1872.pgn"
    )
    result = pgn_data.export()
    result.print_summary()


class MoveTree:
    def __init__(self, root_node) -> None:
        self.nodes = [root_node]
        self.root_node = root_node
        self.current_id = root_node["id"]
        self.child_nodes = []

    def child_indices(self, parent_id: int):
        return filter(lambda x: x["id"] == parent_id, self.nodes)

    def parent_has_move(self, parent_id: int, move: str):
        return sum([self.nodes[child_id]["move"] == move for child_id in self.child_indices(parent_id)])

    def get_move(self, parent_id: int, move: str):
        for node in self.nodes:
            if node["parent_id"] == parent_id and node["move"] == move:
                node["move_count"] += 1
                return node
        self.current_id += 1
        new_node = {
            "id": self.current_id,
            "move": move,
            "parent_id": parent_id,
            "move_count": 1,
            "layer": self.nodes[parent_id]["layer"] + 1,
        }
        self.nodes.append(new_node)
        return new_node

    def insert_sequence(self, move_sequence: str, depth: int) -> None:
        current_node = self.root_node
        for move_count in range(depth):
            if move_count == len(move_sequence):
                break
            current_node = self.get_move(current_node["id"], move_sequence[move_count])


def game_move_sequence():
    moves = pd.read_csv("source/datasets/reference/games_1610_1872_moves.csv")
    games = pd.merge(moves.groupby("game_id").agg({"move_no": lambda x: max(x)}), moves, on=["game_id", "move_no"])

    root_node = {"id": 0, "move": "initial setup", "parent_id": None, "move_count": 1, "layer": 0}
    tree = MoveTree(root_node)

    for move_sequence in games["move_sequence"]:
        tree.insert_sequence(move_sequence.split("|"), 4)

    with open("source/datasets/transformed/move_sequence.json", "w") as f:
        json.dump(tree.nodes, f)
    print(len(tree.nodes))


def GM_birthplace():
    GMs = pd.read_csv("source/datasets/reference/WorldChessGrandMaster.csv")
    # aus_city = pd.read_csv("source/datasets/reference/AUS_state.csv")
    all_city = pd.read_csv("source/datasets/reference/worldcitiespop.csv")

    # def in_aus(city_name: str):
    #  return city_name in aus_city["GCCSA/SUA"].values

    valid_city_GMs = (
        pd.merge(GMs, all_city, left_on="Birthplace", right_on="AccentCity")
        .drop_duplicates(subset=["FIDE ID"])
        .dropna(subset=["Birthplace"])
    )
    valid_city_GMs = valid_city_GMs[["Born", "Died", "Title Year", "Population", "Latitude", "Longitude"]]
    valid_city_GMs["Born"] = valid_city_GMs["Born"].apply(lambda x: x.split("-")[0])
    valid_city_GMs["Died"] = valid_city_GMs["Died"].apply(lambda x: x.split("-")[0] if type(x) == str else None)
    valid_city_GMs.to_csv("source/datasets/transformed/gm_birthplace.csv")


def female_chess():
    players = pd.read_csv("source/datasets/reference/players.csv")
    # rating = pd.read("source/datasets/reference/ratings_2021.csv")
    a = (
        players.groupby(["title", "gender"], as_index=False)
        .agg({"fide_id": lambda x: len(x)})
        .sort_values("fide_id", ascending=False)
    )
    title_list = []

    def switch_gender(gender):
        if gender == "M":
            return 1
        elif gender == "F":
            return 0
        else:
            return 2

    for i in range(len(a["title"])):
        title_list.append(
            {"category": a["title"][i], "position": switch_gender(a["gender"][i]), "value": int(a["fide_id"][i])}
        )

    print(title_list)

    with open("source/datasets/transformed/titled_females.json", "w") as f:
        json.dump(title_list, f)


if __name__ == "__main__":
    # print(GM_count())
    # print(GM_count_normalised())
    # print(GM_normalised_histogram())
    # chess_scatter()
    # chess_scatter_2()
    # chess_scatter_3()
    # pgn_to_csv()
    # game_move_sequence()
    # GM_birthplace()
    female_chess()
