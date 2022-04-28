import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import Grid3x3Icon from '@mui/icons-material/Grid3x3';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ScienceIcon from '@mui/icons-material/Science';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

import qs from 'query-string';

import ContentInner from 'components/Content/ContentInner';
import GotchisLazy from 'components/Lazy/GotchisLazy';
import { GotchiIcon } from 'components/Icons/Icons';
import SortFilterPanel from 'components/SortFilterPanel/SortFilterPanel';
import { ClientContext } from 'contexts/ClientContext';
import { filtersData } from 'data/filters.data';
import commonUtils from 'utils/commonUtils';
import filtersUtils from 'utils/filtersUtils';

const sortings = [
    {
        name: 'id',
        key: 'id',
        tooltip: 'gotchi id',
        icon: <Grid3x3Icon fontSize='small' />
    },
    {
        name: 'mrs',
        key: 'modifiedRarityScore',
        tooltip: 'rarity score',
        icon: <EmojiEventsOutlinedIcon fontSize='small' />
    },
    {
        name: 'brs',
        key: 'baseRarityScore',
        tooltip: 'base rarity score',
        icon: <FormatListNumberedIcon fontSize='small' />
    },
    {
        name: 'kin',
        key: 'kinship',
        tooltip: 'kinship',
        icon: <FavoriteBorderIcon fontSize='small' />
    },
    {
        name: 'experience',
        key: 'experience',
        tooltip: 'experience',
        icon: <ScienceIcon fontSize='small' />
    },
    {
        name: 'age',
        key: 'createdAt',
        tooltip: 'age',
        icon: <CalendarMonthIcon fontSize='small' />
    }
];

const initialFilters = {
    hauntId: {...filtersData.hauntId},
    collateral: {...filtersData.collateral},
    search: {...filtersData.search}
};

export default function ClientGotchis() {
    const history = useHistory();
    const location = useLocation();
    const queryParams = qs.parse(location.search, { arrayFormat: 'comma' });

    const {
        gotchis,
        gotchisSorting,
        setGotchisSorting,
        loadingGotchis
    } = useContext(ClientContext);
    const [currentFilters, setCurrentFilters] = useState({...initialFilters});
    const [sortedFilteredGotchis, setSortedFilteredGotchis] = useState([]);
    const [isSortingChanged, setIsSortingChanged] = useState(false);
    const [isFiltersApplied, setIsFiltersApplied] = useState(false);

    useEffect(() => {
        return () => {
            onResetFilters();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        filtersUtils.updateFiltersFromQueryParams(queryParams, currentFilters)

        setCurrentFilters(currentFilters);
    }, [currentFilters, queryParams]);

    useEffect(() => {
        const activeFilters = Object.entries(currentFilters)
            .filter(([currentKey, currentFilter]) => currentFilter.isFilterActive);

        if (activeFilters.length > 0) {
            setSortedFilteredGotchis(filteredGotchisCache => {
                let filteredGotchis;

                if (isSortingChanged) {
                    filteredGotchis = filteredGotchisCache.filter(lending =>
                        Object.entries(currentFilters).every(([key, filter]) =>
                            filter.isFilterActive ? filter.predicateFn(filter, lending, key) : true
                        )
                    );
                } else {
                    filteredGotchis = gotchis.filter(lending =>
                        Object.entries(currentFilters).every(([key, filter]) =>
                            filter.isFilterActive ? filter.predicateFn(filter, lending, key) : true
                        )
                    );
                }

                return filteredGotchis;
            });

            setIsFiltersApplied(true);
        } else {
            setSortedFilteredGotchis([...gotchis]);
        }
    }, [currentFilters, gotchis, isSortingChanged]);


    const applySorting = useCallback((prop, dir) => {
        const itemsToSort = isSortingChanged || isFiltersApplied ? sortedFilteredGotchis : gotchis;
        const sortedItems = commonUtils.basicSort(itemsToSort, prop, dir);

        setSortedFilteredGotchis([...sortedItems]);
    }, [isSortingChanged, isFiltersApplied, gotchis, sortedFilteredGotchis]);

    const onSortingChanged = useCallback((prop, dir) => {
        applySorting(prop, dir);
        setIsSortingChanged(true);
    }, [applySorting]);

    const sorting = {
        sortingList: sortings,
        sortingDefaults: gotchisSorting,
        setSorting: setGotchisSorting,
        onSortingChanged: onSortingChanged
    };

    const getUpdatedFilters = useCallback(selectedFilters => {
        return filtersUtils.getUpdatedFiltersFromSelectedFilters(selectedFilters, currentFilters);
    }, [currentFilters]);

    const updateQueryParams = useCallback(filters => {
        const params = {...queryParams};

        Object.entries(filters).forEach(([key, filter]) => {
            if (filter.isFilterActive) {
                params[key] = filter.getQueryParamsFn(filter);
            } else {
                delete params[key];
            }
        });

        history.push({
            path: location.pathname,
            search: qs.stringify(params, { arrayFormat: 'comma' })
        });
    }, [queryParams, history, location.pathname]);

    const onApplyFilters = useCallback(selectedFilters => {
        if (Object.keys(selectedFilters).length > 0) {
            setIsFiltersApplied(true);
        }

        const updatedCurrentFilters = getUpdatedFilters(selectedFilters);
        setCurrentFilters(updatedCurrentFilters);
        updateQueryParams(updatedCurrentFilters);
    }, [updateQueryParams, getUpdatedFilters]);

    const onResetFilters = useCallback(() => {
        Object.entries(currentFilters).forEach(([key, filter]) => {
            filter.resetFilterFn(filter);
        });

        setIsFiltersApplied(false);
        setCurrentFilters(currentFilters);
        updateQueryParams(currentFilters);
    }, [currentFilters, updateQueryParams]);

    const getGotchis = useCallback(() => {
        return (isSortingChanged || isFiltersApplied) ? sortedFilteredGotchis: gotchis;
    }, [isSortingChanged, isFiltersApplied, sortedFilteredGotchis, gotchis]);

    return (
        <>
            <SortFilterPanel
                sorting={sorting}
                itemsLength={getGotchis().length}
                placeholder={
                    <GotchiIcon width={20} height={20} />
                }
                isShowFilters={true}
                filters={currentFilters}
                applyFilters={onApplyFilters}
                resetFilters={onResetFilters}
            />

            <ContentInner dataLoading={loadingGotchis}>
                <GotchisLazy
                    items={getGotchis()}
                    render = {[
                        {
                            badges: [
                                'collateral',
                                'rs',
                                'skillpoints',
                                'kinship',
                                'level'
                            ]
                        },
                        'svg',
                        'name',
                        'traits',
                        'wearablesLine',
                        'listing',
                        'rewards'
                    ]}
                />
            </ContentInner>
        </>
    );
}
