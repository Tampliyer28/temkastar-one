import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
 
export default function About() {
    return (
        <AppLayout>
            <div className="prose prose-neutral max-w-none">
                <Card>
                    <CardHeader>
                        <CardTitle>Привет!</CardTitle>
                        <CardDescription>Немного о том, как сделан этот сайт</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p>
                            Этот проект создан с нуля на стеке <strong>Laravel 13 + Inertia + React</strong>.
                            Никаких готовых стартер-китов — только чистый код и полное понимание каждого слоя.
                        </p>
 
                        <div className="grid gap-4 md:grid-cols-3">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg">Бэкенд</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="text-sm space-y-1">
                                        <li>• Laravel 13</li>
                                        <li>• Inertia.js</li>
                                        <li>• PHP 8.2+</li>
                                        <li>• SQLite/MySQL</li>
                                    </ul>
                                </CardContent>
                            </Card>
 
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg">Фронтенд</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="text-sm space-y-1">
                                        <li>• React 19</li>
                                        <li>• Vite 8</li>
                                        <li>• shadcn/ui</li>
                                        <li>• Tailwind CSS</li>
                                    </ul>
                                </CardContent>
                            </Card>
 
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg">Деплой</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="text-sm space-y-1">
                                        <li>• Shared-хостинг</li>
                                        <li>• cPanel/Plesk</li>
                                        <li>• FTP/SFTP</li>
                                        <li>• Без Node.js на сервере</li>
                                    </ul>
                                </CardContent>
                            </Card>
                        </div>
 
                        <p className="text-sm text-muted-foreground">
                            Совет: этот шаблон можно использовать как основу для любого проекта.
                            Просто скопируй структуру и добавь свою бизнес-логику.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}