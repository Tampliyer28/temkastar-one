<!DOCTYPE html>

<html lang="ru">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    
    <!-- ВОТ ЭТА СТРОКА: -->
    <meta name="csrf-token" content="{{ csrf_token() }}"> 
    
    <title inertia></title>
    @viteReactRefresh
    @vite(['resources/js/app.jsx', 'resources/css/app.css'])
</head>
<body>
    @inertia
</body>
</html>