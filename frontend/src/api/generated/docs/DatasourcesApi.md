# DatasourcesApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**createDatabaseSourceApiDatasourcesDatabasePost**](#createdatabasesourceapidatasourcesdatabasepost) | **POST** /api/datasources/database | Create Database Source|
|[**createFileSourceApiDatasourcesFilePost**](#createfilesourceapidatasourcesfilepost) | **POST** /api/datasources/file | Create File Source|
|[**deleteDatasourceApiDatasourcesDsIdDelete**](#deletedatasourceapidatasourcesdsiddelete) | **DELETE** /api/datasources/{ds_id} | Delete Datasource|
|[**listDatasourcesApiDatasourcesGet**](#listdatasourcesapidatasourcesget) | **GET** /api/datasources | List Datasources|
|[**reanalyzeApiDatasourcesDsIdReanalyzePost**](#reanalyzeapidatasourcesdsidreanalyzepost) | **POST** /api/datasources/{ds_id}/reanalyze | Reanalyze|

# **createDatabaseSourceApiDatasourcesDatabasePost**
> any createDatabaseSourceApiDatasourcesDatabasePost(databaseSourceRequest)


### Example

```typescript
import {
    DatasourcesApi,
    Configuration,
    DatabaseSourceRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new DatasourcesApi(configuration);

let databaseSourceRequest: DatabaseSourceRequest; //

const { status, data } = await apiInstance.createDatabaseSourceApiDatasourcesDatabasePost(
    databaseSourceRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **databaseSourceRequest** | **DatabaseSourceRequest**|  | |


### Return type

**any**

### Authorization

[HTTPBearer](../README.md#HTTPBearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successful Response |  -  |
|**422** | Validation Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **createFileSourceApiDatasourcesFilePost**
> any createFileSourceApiDatasourcesFilePost()


### Example

```typescript
import {
    DatasourcesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DatasourcesApi(configuration);

let name: string; // (default to undefined)
let files: Array<string>; // (default to undefined)
let description: string; // (optional) (default to '')

const { status, data } = await apiInstance.createFileSourceApiDatasourcesFilePost(
    name,
    files,
    description
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **name** | [**string**] |  | defaults to undefined|
| **files** | **Array&lt;string&gt;** |  | defaults to undefined|
| **description** | [**string**] |  | (optional) defaults to ''|


### Return type

**any**

### Authorization

[HTTPBearer](../README.md#HTTPBearer)

### HTTP request headers

 - **Content-Type**: multipart/form-data
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successful Response |  -  |
|**422** | Validation Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **deleteDatasourceApiDatasourcesDsIdDelete**
> any deleteDatasourceApiDatasourcesDsIdDelete()


### Example

```typescript
import {
    DatasourcesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DatasourcesApi(configuration);

let dsId: number; // (default to undefined)

const { status, data } = await apiInstance.deleteDatasourceApiDatasourcesDsIdDelete(
    dsId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **dsId** | [**number**] |  | defaults to undefined|


### Return type

**any**

### Authorization

[HTTPBearer](../README.md#HTTPBearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successful Response |  -  |
|**422** | Validation Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **listDatasourcesApiDatasourcesGet**
> any listDatasourcesApiDatasourcesGet()


### Example

```typescript
import {
    DatasourcesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DatasourcesApi(configuration);

const { status, data } = await apiInstance.listDatasourcesApiDatasourcesGet();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**any**

### Authorization

[HTTPBearer](../README.md#HTTPBearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successful Response |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **reanalyzeApiDatasourcesDsIdReanalyzePost**
> any reanalyzeApiDatasourcesDsIdReanalyzePost()


### Example

```typescript
import {
    DatasourcesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DatasourcesApi(configuration);

let dsId: number; // (default to undefined)

const { status, data } = await apiInstance.reanalyzeApiDatasourcesDsIdReanalyzePost(
    dsId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **dsId** | [**number**] |  | defaults to undefined|


### Return type

**any**

### Authorization

[HTTPBearer](../README.md#HTTPBearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successful Response |  -  |
|**422** | Validation Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

