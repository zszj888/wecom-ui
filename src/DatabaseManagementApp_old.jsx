import React, {useEffect, useRef, useState, useCallback} from 'react';
import {Database, Play, Table, RefreshCcw, Users, Building, Settings, ChevronDown, ChevronUp} from 'lucide-react';
import Split from 'react-split';

const DatabaseManagementApp = () => {
    const [databases, setDatabases] = useState([]);
    const [databaseTables, setDatabaseTables] = useState({});  // New state for storing tables by database
    const [currentDatabase, setCurrentDatabase] = useState('');
    const [activeTable, setActiveTable] = useState('');
    const [activeTab, setActiveTab] = useState('data');
    const [tableData, setTableData] = useState({data: [], columns: [], total: 0, page: 1, size: 20});
    const [sqlQuery, setSqlQuery] = useState('');
    const [sqlResult, setSqlResult] = useState(null);
    const [tableStructure, setTableStructure] = useState([]);
    const sqlTextareaRef = useRef(null);
    const [sqlLoading, setSqlLoading] = useState(false);
    const [sqlError, setSqlError] = useState(null);
    const [syncLoading, setSyncLoading] = useState(false);
    const [syncError, setSyncError] = useState(null);
    const [userSyncState, setUserSyncState] = useState({
        loading: false,
        error: null,
        batchNo: '',
        logs: [],
        notifyConfigs: [],
    });
    const [wecomState, setWecomState] = useState({
        loading: false,
        error: null
    });
    const [showAdminPanels, setShowAdminPanels] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingTables, setIsLoadingTables] = useState(false);
    const [isLoadingStructure, setIsLoadingStructure] = useState(false);
    const [isLoadingTableData, setIsLoadingTableData] = useState(false);
    const loadedTablesRef = useRef(new Set());
    const loadedStructuresRef = useRef(new Set());

    // Fetch databases on component mount
    useEffect(() => {
        if (!isLoading) {
            fetchDatabases();
        }
    }, []); // 移除 isLoading 依赖，仅在组件挂载时调用一次

    // Fetch databases
    const fetchDatabases = async () => {
        if (isLoading) return; // 防止重复调用
        
        try {
            setIsLoading(true);
            console.log('Fetching databases...'); // 添加日志
            const response = await fetch('/db-manager/api/databases');
            if (!response.ok) {
                throw new Error(`Failed to fetch databases: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();
            console.log('Received databases:', data); // 添加日志

            setDatabases(data);
            
            if (data && data.length > 0) {
                const firstDb = data[0];
                console.log('Setting current database to:', firstDb); // 添加日志
                setCurrentDatabase(firstDb);
                
                // 获取第一个数据库的表
                console.log('Fetching tables for database:', firstDb); // 添加日志
                const tablesResponse = await fetch(`/db-manager/api/tables?dbName=${encodeURIComponent(firstDb)}`);
                if (!tablesResponse.ok) {
                    throw new Error(`Failed to fetch tables: ${tablesResponse.status} ${tablesResponse.statusText}`);
                }
                const tablesData = await tablesResponse.json();
                console.log('Received tables:', tablesData); // 添加日志
                
                setDatabaseTables(prev => ({
                    ...prev,
                    [firstDb]: tablesData
                }));
                
                // 如果有表，选择第一个表并加载其数据
                if (tablesData && tablesData.length > 0) {
                    const firstTable = tablesData[0];
                    console.log('Setting active table to:', firstTable); // 添加日志
                    setActiveTable(firstTable);
                    
                    // 使用 Promise.all 并发加载表数据和结构
                    await Promise.all([
                        fetchTableData(firstDb, firstTable),
                        fetchTableStructure(firstDb, firstTable)
                    ]);
                }
                
                // 然后异步加载其他数据库的表
                if (data.length > 1) {
                    console.log('Fetching tables for other databases...'); // 添加日志
                    data.slice(1).forEach(db => fetchTables(db));
                }
            }
        } catch (error) {
            console.error('Error in fetchDatabases:', error);
            // 可以添加一个状态来显示错误信息
            setDatabases([]); // 确保在错误时设置空数组
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch tables for a specific database
    const fetchTables = useCallback(async (dbName) => {
        if (isLoadingTables || loadedTablesRef.current.has(dbName)) {
            return;
        }

        try {
            setIsLoadingTables(true);
            console.log('Fetching tables for:', dbName); // 添加日志
            const response = await fetch(`/db-manager/api/tables?dbName=${encodeURIComponent(dbName)}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch tables for ${dbName}: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();
            console.log('Received tables for', dbName, ':', data); // 添加日志
            
            setDatabaseTables(prev => ({
                ...prev,
                [dbName]: data
            }));
            
            loadedTablesRef.current.add(dbName);
            
            if (dbName === currentDatabase && data && data.length > 0 && !activeTable) {
                setActiveTable(data[0]);
                await Promise.all([
                    fetchTableData(dbName, data[0]),
                    fetchTableStructure(dbName, data[0])
                ]);
            }
        } catch (error) {
            console.error(`Error fetching tables for ${dbName}:`, error);
            setDatabaseTables(prev => ({
                ...prev,
                [dbName]: []
            }));
        } finally {
            setIsLoadingTables(false);
        }
    }, []);

    const fetchTableStructure = useCallback(async (dbName, tableName) => {
        const cacheKey = `${dbName}:${tableName}`;
        if (isLoadingStructure || loadedStructuresRef.current.has(cacheKey)) {
            return;
        }

        try {
            setIsLoadingStructure(true);
            const response = await fetch(`/db-manager/api/table-structure?dbName=${dbName}&tableName=${tableName}`);
            const data = await response.json();
            setTableStructure(data);
            loadedStructuresRef.current.add(cacheKey);
        } catch (error) {
            console.error('Failed to fetch table structure:', error);
        } finally {
            setIsLoadingStructure(false);
        }
    }, [isLoadingStructure]);

    // Fetch table data
    const fetchTableData = useCallback(async (dbName, tableName, page = 1, size = 20) => {
        if (isLoadingTableData) {
            return;
        }

        try {
            setIsLoadingTableData(true);
            const response = await fetch(`/db-manager/api/table-data?dbName=${dbName}&tableName=${tableName}&page=${page}&size=${size}`);
            const data = await response.json();
            setTableData(data);
        } catch (error) {
            console.error('Failed to fetch table data:', error);
        } finally {
            setIsLoadingTableData(false);
        }
    }, [isLoadingTableData]);

    // New utility functions
    const extractTableNames = (sql) => {
        // 只匹配FROM和JOIN后面的表名
        const regex = /\b(FROM|JOIN)\s+([a-zA-Z_][a-zA-Z0-9_]*)\b/gi;
        const matches = [...sql.matchAll(regex)];
        return [...new Set(matches.map(match => match[2].toLowerCase()))];
    };

    const findDatabaseForTable = (tableName) => {
        for (const dbName of databases) {
            if (databaseTables[dbName]?.some(t => t.toLowerCase() === tableName.toLowerCase())) {
                return dbName;
            }
        }
        return currentDatabase; // 如果找不到匹配的数据库，使用当前数据库
    };

    // Modified executeSql function
    const executeSql = async () => {
        try {
            setSqlLoading(true);
            setSqlError(null);

            // 提取SQL中的表名并找到对应的数据库
            const tableNames = extractTableNames(sqlQuery);
            const targetDb = tableNames.length > 0 ? findDatabaseForTable(tableNames[0]) : currentDatabase;
            
            // 在执行SQL前更新当前数据库上下文
            setCurrentDatabase(targetDb);

            const response = await fetch('/db-manager/api/execute-sql', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `dbName=${targetDb}&sql=${encodeURIComponent(sqlQuery)}`
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to execute SQL');
            }
            setSqlResult(data);
            setActiveTab('sqlResult');
        } catch (error) {
            console.error('Failed to execute SQL:', error);
            setSqlError(error.message);
        } finally {
            setSqlLoading(false);
        }
    };

    // Delete data
    const deleteData = async (id) => {
        try {
            const response = await fetch(`/db-manager/api/delete-data?dbName=${currentDatabase}&tableName=${activeTable}&id=${id}`, {
                method: 'DELETE'
            });
            const data = await response.json();
            if (data.success) {
                fetchTableData(currentDatabase, activeTable);
            }
        } catch (error) {
            console.error('Failed to delete data:', error);
        }
    };

    // Handle database change
    const handleDatabaseChange = useCallback((dbName) => {
        setCurrentDatabase(dbName);
        if (!loadedTablesRef.current.has(dbName)) {
            fetchTables(dbName);
        }
    }, [fetchTables]);

    // Handle table selection
    const handleTableSelect = useCallback(async (tableName) => {
        if (tableName === activeTable) {
            return; // 避免重复加载相同的表
        }

        setActiveTable(tableName);
        const cacheKey = `${currentDatabase}:${tableName}`;
        
        if (!loadedStructuresRef.current.has(cacheKey)) {
            await fetchTableStructure(currentDatabase, tableName);
        }
        await fetchTableData(currentDatabase, tableName);
    }, [currentDatabase, activeTable, fetchTableStructure, fetchTableData]);

    // Render table data
    const renderTableData = () => {
        if (!tableData.columns.length) {
            return <div className="text-gray-500 text-center py-6">No data available</div>;
        }

        return (
            <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{activeTable}</h3>
                    <span
                        className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{tableData.total} rows</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-sm">
                        <thead className="bg-gray-50">
                        <tr>
                            {tableData.columns.map(col => (
                                <th key={col}
                                    className="px-4 py-3 border-b border-gray-200 text-left font-semibold text-gray-700">{col}</th>
                            ))}
                            <th className="px-4 py-3 border-b border-gray-200 text-left font-semibold text-gray-700 w-24">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {tableData.data.map((row, index) => (
                            <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                                {tableData.columns.map(col => (
                                    <td key={col}
                                        className="px-4 py-2.5 border-b border-gray-200 text-gray-600">{row[col]}</td>
                                ))}
                                <td className="px-4 py-2.5 border-b border-gray-200">
                                    <button
                                        onClick={() => deleteData(row.id)}
                                        className="text-red-500 hover:text-red-600 text-sm font-medium transition-colors duration-200"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
                <div className="mt-4 flex items-center justify-between px-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <span>每页 {tableData.size} 条</span>
                        <span>共 {tableData.total} 条</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => fetchTableData(currentDatabase, activeTable, tableData.page - 1, tableData.size)}
                            disabled={tableData.page <= 1}
                            className={`px-3 py-1 rounded ${tableData.page <= 1 
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'}`}
                        >
                            上一页
                        </button>
                        <span className="px-3 py-1 bg-gray-50 rounded">
                            第 {tableData.page} 页 / 共 {Math.ceil(tableData.total / tableData.size)} 页
                        </span>
                        <button
                            onClick={() => fetchTableData(currentDatabase, activeTable, tableData.page + 1, tableData.size)}
                            disabled={tableData.page >= Math.ceil(tableData.total / tableData.size)}
                            className={`px-3 py-1 rounded ${tableData.page >= Math.ceil(tableData.total / tableData.size)
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'}`}
                        >
                            下一页
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // Render SQL results
    const renderSqlResult = () => {
        if (!sqlResult) {
            return <div className="text-gray-500 text-center py-4">No SQL result yet. Execute a query to see
                results.</div>;
        }

        return (
            <div>
                <div className="flex justify-between items-center mb-2 px-4">
                    <h3 className="text-base font-semibold text-gray-800">SQL Result</h3>
                    <span className="text-sm text-gray-500">
                        {sqlResult.type === 'SELECT' ? `${sqlResult.data.length} rows` : 'Query executed'}
                    </span>
                </div>
                {sqlResult.columns && sqlResult.data && (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-sm">
                            <thead className="bg-gray-50">
                            <tr>
                                {sqlResult.columns.map(col => (
                                    <th key={col}
                                        className="px-3 py-2 border-b text-left font-medium text-gray-700">{col}</th>
                                ))}
                            </tr>
                            </thead>
                            <tbody>
                            {sqlResult.data.map((row, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                    {sqlResult.columns.map(col => (
                                        <td key={col} className="px-3 py-1.5 border-b text-gray-600">{row[col]}</td>
                                    ))}
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        );
    };

    // Render structure view
    const renderStructure = () => {
        if (tableStructure.length <= 0) {
            return (
                <div className="px-4">
                    <h3 className="text-base font-semibold text-gray-800 mb-2">Table Structure</h3>
                    <div className="text-gray-500 text-center py-4">No structure information</div>
                </div>
            );
        }
        return (
            <div className="px-4">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-base font-semibold text-gray-800">Table Structure: {activeTable}</h3>
                    <span className="text-sm text-gray-500">{tableStructure.length} columns</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-sm">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-3 py-2 border-b text-left font-medium text-gray-700">Column Name</th>
                            <th className="px-3 py-2 border-b text-left font-medium text-gray-700">Data Type</th>
                            <th className="px-3 py-2 border-b text-left font-medium text-gray-700">Nullable</th>
                            <th className="px-3 py-2 border-b text-left font-medium text-gray-700">Default Value</th>
                            <th className="px-3 py-2 border-b text-left font-medium text-gray-700">Comment</th>
                        </tr>
                        </thead>
                        <tbody>
                        {tableStructure.map((column, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                                <td className="px-3 py-1.5 border-b text-gray-600">{column.column_name}</td>
                                <td className="px-3 py-1.5 border-b text-gray-600">{column.data_type}</td>
                                <td className="px-3 py-1.5 border-b text-gray-600">{column.is_nullable}</td>
                                <td className="px-3 py-1.5 border-b text-gray-600">{column.column_default || '-'}</td>
                                <td className="px-3 py-1.5 border-b text-gray-600">{column.column_comment || '-'}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const handleSyncAadUsers = async () => {
        try {
            setSyncLoading(true);
            setSyncError(null);
            const response = await fetch('/admin/aad_users/manual_sync', {
                method: 'PUT'
            });
            
            if (!response.ok) {
                throw new Error('Failed to sync AAD users');
            }
            
            const syncedCount = await response.json();
            alert(`Successfully synced ${syncedCount} users`);
        } catch (error) {
            console.error('Failed to sync AAD users:', error);
            setSyncError(error.message);
        } finally {
            setSyncLoading(false);
        }
    };

    const handleUserSync = async (corpId) => {
        try {
            setUserSyncState(prev => ({ ...prev, loading: true, error: null }));
            const response = await fetch(`/userSync/${corpId}`, {
                method: 'POST'
            });
            const batchNo = await response.text();
            setUserSyncState(prev => ({ ...prev, batchNo }));
            await fetchSyncLogs(batchNo);
        } catch (error) {
            setUserSyncState(prev => ({ ...prev, error: error.message }));
        } finally {
            setUserSyncState(prev => ({ ...prev, loading: false }));
        }
    };

    const fetchSyncLogs = async (batchNo) => {
        try {
            const response = await fetch(`/userSync/batchNo/${batchNo}/logs`);
            const logs = await response.json();
            setUserSyncState(prev => ({ ...prev, logs }));
        } catch (error) {
            console.error('Failed to fetch sync logs:', error);
        }
    };

    const updateJobCron = async (jobId, cron) => {
        try {
            await fetch(`/userSync/jobs/jobIds/${jobId}/manualUpdate?cron=${cron}`, {
                method: 'PUT'
            });
            alert('Job cron updated successfully');
        } catch (error) {
            console.error('Failed to update job cron:', error);
        }
    };

    const updateNotifyConfigs = async (toUser) => {
        try {
            const response = await fetch(`/userSync/notifyConfigs?toUser=${toUser}`, {
                method: 'PUT'
            });
            const configs = await response.json();
            setUserSyncState(prev => ({ ...prev, notifyConfigs: configs }));
        } catch (error) {
            console.error('Failed to update notify configs:', error);
        }
    };

    const handleLoggedUsersSync = async (sourceUserIds) => {
        try {
            const response = await fetch('/userSync/loggedUsers/syncAadId', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `sourceUserIds=${sourceUserIds.join(',')}`
            });
            const result = await response.json();
            alert(`Synced ${result.length} users`);
        } catch (error) {
            console.error('Failed to sync logged users:', error);
        }
    };

    const handleUpdateNotLoggedUsers = async () => {
        try {
            await fetch('/userSync/notLoggedUsers/updateState', {
                method: 'PUT'
            });
            await fetch('/userSync/notLoggedUsers/deleteInWechat', {
                method: 'PUT'
            });
            await fetch('/userSync/notLoggedUsers', {
                method: 'DELETE'
            });
            alert('Not logged users have been processed');
        } catch (error) {
            console.error('Failed to process not logged users:', error);
        }
    };

    // Compact admin panels render function
    const renderCompactAdminPanels = () => (
        <div className="mb-3">
            <button
                onClick={() => setShowAdminPanels(!showAdminPanels)}
                className="flex items-center px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors border border-gray-300"
            >
                <Settings className="mr-2 h-4 w-4"/>
                管理面板
                {showAdminPanels ? (
                    <ChevronUp className="ml-2 h-4 w-4" />
                ) : (
                    <ChevronDown className="ml-2 h-4 w-4" />
                )}
            </button>

            {showAdminPanels && (
                <div className="mt-3 space-y-3">
                    {/* User Sync Operations - Compact */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="p-3 border-b border-gray-100">
                            <h4 className="text-sm font-medium flex items-center text-gray-700">
                                <Users className="mr-2 h-4 w-4"/>
                                User Sync Operations
                            </h4>
                        </div>
                        <div className="p-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Corp ID"
                                        className="px-2 py-1 border rounded text-sm flex-1"
                                        id="corpIdInput"
                                    />
                                    <button
                                        onClick={() => handleUserSync(document.getElementById('corpIdInput').value)}
                                        disabled={userSyncState.loading}
                                        className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
                                    >
                                        Sync Users
                                    </button>
                                </div>

                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="To User"
                                        className="px-2 py-1 border rounded text-sm flex-1"
                                        id="toUserInput"
                                    />
                                    <button
                                        onClick={() => updateNotifyConfigs(document.getElementById('toUserInput').value)}
                                        className="px-2 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 text-xs"
                                    >
                                        Update Notify
                                    </button>
                                </div>

                                <div className="flex gap-2 md:col-span-2">
                                    <input
                                        type="text"
                                        placeholder="Source User IDs (comma-separated)"
                                        className="px-2 py-1 border rounded text-sm flex-1"
                                        id="sourceUserIdsInput"
                                    />
                                    <button
                                        onClick={() => handleLoggedUsersSync(
                                            document.getElementById('sourceUserIdsInput').value.split(',')
                                        )}
                                        className="px-2 py-1 bg-orange-600 text-white rounded hover:bg-orange-700 text-xs"
                                    >
                                        Sync Logged
                                    </button>
                                </div>

                                <button
                                    onClick={handleUpdateNotLoggedUsers}
                                    className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs"
                                >
                                    Process Not Logged
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* WeCom Sync Operations - Compact */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="p-3 border-b border-gray-100">
                            <h4 className="text-sm font-medium flex items-center text-gray-700">
                                <RefreshCcw className="mr-2 h-4 w-4"/>
                                WeCom Sync Operations
                            </h4>
                        </div>
                        <div className="p-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                <button onClick={() => handleWecomAction('/syncDept')}
                                        className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs">
                                    Sync Departments
                                </button>
                                <button onClick={() => handleWecomAction('/initUser')}
                                        className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs">
                                    Sync Users
                                </button>

                                <div className="flex gap-2 md:col-span-2">
                                    <input type="text" id="targetDept" placeholder="Target Department"
                                           className="px-2 py-1 border rounded text-sm flex-1"/>
                                    <button onClick={() => {
                                        const dept = document.getElementById('targetDept').value;
                                        handleWecomAction(`/rePushHKDept/${dept}`, 'POST');
                                    }} className="px-2 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 text-xs">
                                        Re-Push HK Dept
                                    </button>
                                </div>

                                <div className="flex gap-2 md:col-span-2">
                                    <input type="text" id="adUsername" placeholder="AD Username"
                                           className="px-2 py-1 border rounded text-sm flex-1"/>
                                    <button onClick={() => {
                                        const username = document.getElementById('adUsername').value;
                                        handleWecomAction(`/admin/manual/disable/${username}`, 'POST');
                                    }} className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs">
                                        Disable User
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    // Add new WeComSync functions
    const handleWecomAction = async (endpoint, method = 'GET', body = null) => {
        try {
            setWecomState(prev => ({ ...prev, loading: true, error: null }));
            const options = {
                method,
                headers: {
                    'Content-Type': 'application/json'
                }
            };
            if (body) {
                options.body = JSON.stringify(body);
            }
            const response = await fetch(`/b${endpoint}`, options);
            const data = await response.json();
            return data;
        } catch (error) {
            setWecomState(prev => ({ ...prev, error: error.message }));
            throw error;
        } finally {
            setWecomState(prev => ({ ...prev, loading: false }));
        }
    };



    return (
        <Split 
            sizes={[10, 90]}
            minSize={200}
            expandToMin={false}
            gutterSize={4}
            gutterAlign="center"
            snapOffset={30}
            dragInterval={1}
            className="flex min-h-screen bg-gray-100 font-sans antialiased split"
        >
            {/* Sidebar */}
            <div className="bg-white border-r border-gray-200 shadow-lg overflow-y-auto">
                <div className="p-4 border-b border-gray-200 flex items-center">
                    <h4 className="text-xl font-bold text-gray-900 flex items-center">
                        <Database className="mr-2 h-6 w-6 text-indigo-600"/>
                        DB Manager
                    </h4>
                </div>

                {/* Database and Tables List */}
                <div className="p-4">
                    <div className="space-y-4">
                        {databases.map(dbName => (
                            <div key={dbName} className="space-y-1">
                                <div className="font-bold text-base text-gray-900 px-3 py-2.5 bg-gray-50 rounded">
                                    {dbName}
                                </div>
                                <div className="pl-3 space-y-1">
                                    {databaseTables[dbName]?.map(table => (
                                        <button
                                            key={`${dbName}-${table}`}
                                            onClick={async () => {
                                                setCurrentDatabase(dbName);
                                                setActiveTable(table);
                                                try {
                                                    await Promise.all([
                                                        fetchTableData(dbName, table),
                                                        fetchTableStructure(dbName, table)
                                                    ]);
                                                } catch (error) {
                                                    console.error('Failed to load table data:', error);
                                                }
                                            }}
                                            className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center transition-all duration-200 ${
                                                currentDatabase === dbName && activeTable === table
                                                    ? 'bg-indigo-50 text-indigo-700 font-medium'
                                                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                                            }`}
                                        >
                                            <Table size={16} className="mr-2 text-gray-500"/>
                                            {table}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="p-6 overflow-auto">
                {renderCompactAdminPanels()}
                <div className="mb-6 bg-white rounded-xl shadow-md border border-gray-200">
                    <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                Current DB: {currentDatabase}
                            </span>
                            <button
                                onClick={handleSyncAadUsers}
                                disabled={syncLoading}
                                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                                    ${syncLoading 
                                    ? 'bg-gray-300 cursor-not-allowed' 
                                    : 'bg-green-600 text-white hover:bg-green-700'}`}
                            >
                                {syncLoading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Syncing AAD Users...
                                    </>
                                ) : (
                                    'Sync AAD Users'
                                )}
                            </button>
                            {syncError && (
                                <span className="text-sm text-red-600">
                                    Sync failed: {syncError}
                                </span>
                            )}
                        </div>
                        <button
                            onClick={executeSql}
                            disabled={sqlLoading}
                            className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                                ${sqlLoading 
                                ? 'bg-gray-300 cursor-not-allowed' 
                                : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                        >
                            {sqlLoading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Executing...
                                </>
                            ) : (
                                <>
                                    <Play size={16} className="mr-2"/> Execute
                                </>
                            )}
                        </button>
                    </div>
                    <div className="px-4 pb-4">
                        <textarea
                            ref={sqlTextareaRef}
                            value={sqlQuery}
                            onChange={(e) => setSqlQuery(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey && !sqlLoading) {
                                    e.preventDefault();
                                    executeSql();
                                }
                            }}
                            className="w-full h-40 p-3 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 transition-all duration-200 resize-y"
                            placeholder="Enter your SQL query here... (Press Enter to execute, Shift+Enter for new line)"
                        />
                        {sqlError && (
                            <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-sm text-red-600">{sqlError}</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mb-6 flex space-x-6 border-b border-gray-200">
                    {['data', 'structure', 'sqlResult'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-3 px-2 text-sm font-medium capitalize relative transition-all duration-200 ${
                                activeTab === tab
                                    ? 'text-indigo-600 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-indigo-600'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="bg-white rounded-xl shadow-md border border-gray-200">
                    {activeTab === 'data' && renderTableData()}
                    {activeTab === 'structure' && renderStructure()}
                    {activeTab === 'sqlResult' && renderSqlResult()}
                </div>
            </div>
        </Split>
    );
};

export default DatabaseManagementApp;