import { FeatureCardProps } from "../types";

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description }) => {
	return (
		<div
			className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 
                  hover:shadow-lg hover:border-primary-300 dark:hover:border-primary-500 
                  transition-all duration-300 transform hover:-translate-y-1"
		>
			<h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
				{title}
			</h3>
			<p className="text-gray-700 dark:text-gray-300 leading-relaxed">
				{description}
			</p>
			<div className="w-12 h-1 bg-primary-500 dark:bg-primary-400 mt-4 rounded-full"></div>
		</div>
	);
};

export default FeatureCard;
