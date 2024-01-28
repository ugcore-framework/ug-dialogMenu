local UgCore = exports['ug-core']:GetCore()

local Timeouts, OpennedMenus, MenuType = { }, { }, 'dialog'

local function OpenMenu(namespace, name, data)
	for i = 1, #Timeouts, 1 do
		UgCore.Shared.ClearTimeout(Timeouts[i])
	end

	OpennedMenus[namespace .. '_' .. name] = true

	SendNUIMessage({
		action = 'openMenu',
		namespace = namespace,
		name = name,
		data = data
	})

	local timeoutId = UgCore.Shared.SetTimeout(200, function()
		SetNuiFocus(true, true)
	end)

	Timeouts[#Timeouts + 1] = timeoutId
end

local function CloseMenu(namespace, name)
	OpennedMenus[namespace .. '_' .. name] = nil

	SendNUIMessage({
		action = 'closeMenu',
		namespace = namespace,
		name = name,
	})

	if not next(OpennedMenus) then
		SetNuiFocus(false)
	end
end

UgCore.Menus.Functions.RegisterType(MenuType, OpenMenu, CloseMenu)

AddEventHandler('ug-dialogMenu:Message:Menu_Submit', function(data)
	local menu = UgCore.Menus.Functions.GetMenuOpenned(MenuType, data._namespace, data._name)
	local cancel = false

	if menu.submit then
		if tonumber(data.value) then
			data.value = UgCore.Shared.Math.Round(tonumber(data.value))

			if tonumber(data.value) <= 0 then
				cancel = true
			end
		end

		data.value = UgCore.Shared.Math.Trim(data.value)

		if cancel then
			UgCore.Functions.Notify('That input is not allowed!', 'error', 5000)
		else
			menu.submit(data, menu)
		end
	end
end)

AddEventHandler('ug-dialogMenu:Message:Menu_Cancel', function(data)
	local menu = UgCore.Menus.Functions.GetMenuOpenned(MenuType, data._namespace, data._name)

	if menu.cancel ~= nil then
		menu.cancel(data, menu)
	end
end)

AddEventHandler('ug-dialogMenu:Message:Menu_Change', function(data)
	local menu = UgCore.Menus.Functions.GetMenuOpenned(MenuType, data._namespace, data._name)

	if menu.change ~= nil then
		menu.change(data, menu)
	end
end)