# SettingsApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**activateConfigApiSettingsLlmConfigIdActivatePost**](#activateconfigapisettingsllmconfigidactivatepost) | **POST** /api/settings/llm/{config_id}/activate | Activate Config|
|[**createConfigApiSettingsLlmPost**](#createconfigapisettingsllmpost) | **POST** /api/settings/llm | Create Config|
|[**deleteConfigApiSettingsLlmConfigIdDelete**](#deleteconfigapisettingsllmconfigiddelete) | **DELETE** /api/settings/llm/{config_id} | Delete Config|
|[**listConfigsApiSettingsLlmGet**](#listconfigsapisettingsllmget) | **GET** /api/settings/llm | List Configs|
|[**updateConfigApiSettingsLlmConfigIdPut**](#updateconfigapisettingsllmconfigidput) | **PUT** /api/settings/llm/{config_id} | Update Config|

# **activateConfigApiSettingsLlmConfigIdActivatePost**
> any activateConfigApiSettingsLlmConfigIdActivatePost()


### Example

```typescript
import {
    SettingsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SettingsApi(configuration);

let configId: number; // (default to undefined)

const { status, data } = await apiInstance.activateConfigApiSettingsLlmConfigIdActivatePost(
    configId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **configId** | [**number**] |  | defaults to undefined|


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

# **createConfigApiSettingsLlmPost**
> any createConfigApiSettingsLlmPost(lLMConfigRequest)


### Example

```typescript
import {
    SettingsApi,
    Configuration,
    LLMConfigRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new SettingsApi(configuration);

let lLMConfigRequest: LLMConfigRequest; //

const { status, data } = await apiInstance.createConfigApiSettingsLlmPost(
    lLMConfigRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **lLMConfigRequest** | **LLMConfigRequest**|  | |


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

# **deleteConfigApiSettingsLlmConfigIdDelete**
> any deleteConfigApiSettingsLlmConfigIdDelete()


### Example

```typescript
import {
    SettingsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SettingsApi(configuration);

let configId: number; // (default to undefined)

const { status, data } = await apiInstance.deleteConfigApiSettingsLlmConfigIdDelete(
    configId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **configId** | [**number**] |  | defaults to undefined|


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

# **listConfigsApiSettingsLlmGet**
> any listConfigsApiSettingsLlmGet()


### Example

```typescript
import {
    SettingsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SettingsApi(configuration);

const { status, data } = await apiInstance.listConfigsApiSettingsLlmGet();
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

# **updateConfigApiSettingsLlmConfigIdPut**
> any updateConfigApiSettingsLlmConfigIdPut(lLMConfigRequest)


### Example

```typescript
import {
    SettingsApi,
    Configuration,
    LLMConfigRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new SettingsApi(configuration);

let configId: number; // (default to undefined)
let lLMConfigRequest: LLMConfigRequest; //

const { status, data } = await apiInstance.updateConfigApiSettingsLlmConfigIdPut(
    configId,
    lLMConfigRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **lLMConfigRequest** | **LLMConfigRequest**|  | |
| **configId** | [**number**] |  | defaults to undefined|


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

