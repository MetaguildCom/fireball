import collaterals from 'data/collaterals';
import { FilterComponent, FilterDomainType } from 'data/filterTypes';
import filterHelpers from 'utils/filterFunctions.helper';

export const filtersData = {
    hauntId: {
        key: 'hauntId',
        domainType: FilterDomainType.Equals,
        componentType: FilterComponent.MultipleAutocomplete,
        placeholder: 'HauntId',
        items: [
            {
                title: 'Haunt 1',
                value: '1',
                isSelected: false,
                queryParamValue: '1'
            },
            {
                title: 'Haunt 2',
                value: '2',
                isSelected: false,
                queryParamValue: '2'
            }
        ],
        isFilterActive: false,
        resetFilterFn: filterHelpers.multipleSelectionResetFilterFn,
        predicateFn: filterHelpers.multipleSelectionPredicateFn,
        updateFromQueryFn: filterHelpers.multipleSelectionUpdateFromQueryFn,
        updateFromFilterFn: filterHelpers.multipleSelectionUpdateFromFilterFn,
        getQueryParamsFn: filterHelpers.multipleSelectionGetQueryParamsFn
    },
    collateral: {
        key: 'collateral',
        domainType: FilterDomainType.Equals,
        componentType: FilterComponent.MultipleAutocomplete,
        placeholder: 'Collateral',
        items: collaterals.map(collateral => ({
            title: collateral.name,
            value: collateral.address,
            isSelected: false,
            queryParamValue: collateral.name.toLowerCase()
        })),
        isFilterActive: false,
        resetFilterFn: filterHelpers.multipleSelectionResetFilterFn,
        predicateFn: filterHelpers.multipleSelectionPredicateFn,
        updateFromQueryFn: filterHelpers.multipleSelectionUpdateFromQueryFn,
        updateFromFilterFn: filterHelpers.multipleSelectionUpdateFromFilterFn,
        getQueryParamsFn: filterHelpers.multipleSelectionGetQueryParamsFn
    },
    search: {
        key: 'search',
        isMultipleKeys: true,
        keys: ['id', 'name'],
        domainType: FilterDomainType.Contains,
        componentType: FilterComponent.Input,
        placeholder: 'Name&Id',
        value: '',
        isFilterActive: false,
        resetFilterFn: filterHelpers.inputResetFilterFn,
        predicateFn: filterHelpers.inputPredicateFn,
        updateFromQueryFn: filterHelpers.inputUpdateFromQueryFn,
        updateFromFilterFn: filterHelpers.inputUpdateFromFilterFn,
        getQueryParamsFn: filterHelpers.inputGetQueryParamsFn
    }
};